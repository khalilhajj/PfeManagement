import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

from report.models import Report

pytestmark = pytest.mark.django_db


@pytest.fixture
def user():
    User = get_user_model()
    return User.objects.create_user(
        username="student_user",
        email="student@example.com",
        password="StudentPass123!",
    )


@pytest.fixture
def report(user):
    test_file = SimpleUploadedFile(
        "report.pdf",
        b"dummy content",
        content_type="application/pdf",
    )
    return Report.objects.create(
        name="My First Report",
        description="Some description",
        file_path=test_file,
        added_by=user,
    )


def test_report_str(report):
    """
    __str__ should return the report name.
    (Matches: def __str__(self): return self.name)
    """
    assert str(report) == report.name


def test_report_default_is_not_archived(report):
    """
    is_archived should default to False.
    """
    assert report.is_archived is False


def test_report_publish_date_auto_set(report):
    """
    publish_date is auto_now_add, so it should be set on creation.
    """
    from datetime import date

    assert report.publish_date is not None
    assert isinstance(report.publish_date, date)


def test_report_related_name_reports_on_user(user, report):
    """
    User.reports related_name should allow reverse lookup.
    """
    reports = list(user.reports.all())
    assert report in reports
