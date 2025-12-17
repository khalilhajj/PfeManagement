import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

from report.models import Report
from report.serializer import ReportSerializer

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
def report_file():
    return SimpleUploadedFile(
        "report.pdf",
        b"dummy content",
        content_type="application/pdf",
    )


@pytest.fixture
def report(user, report_file):
    return Report.objects.create(
        name="Existing Report",
        description="Existing description",
        file_path=report_file,
        added_by=user,
    )


def test_report_serializer_basic(report):
    """
    Serializer should expose all fields correctly for an existing report.
    """
    serializer = ReportSerializer(report)
    data = serializer.data

    assert data["id"] == report.id
    assert data["name"] == report.name
    assert data["description"] == report.description
    assert data["is_archived"] == report.is_archived

    # added_by is read-only, but for serialization it should return the user id
    assert data["added_by"] == report.added_by.id

    # file_path is serialized as a URL or path string; compare by name
    assert "file_path" in data
    # data["file_path"] might include MEDIA_URL, so just ensure it ends with the stored name
    assert data["file_path"].endswith(report.file_path.name)

    # publish_date is a DateField, serialized as YYYY-MM-DD string
    if report.publish_date is not None:
        assert data["publish_date"] == str(report.publish_date)


def test_report_serializer_create(user, report_file):
    """
    Serializer should create a Report instance from valid data.
    Note: added_by is read_only, so we pass it to save().
    """
    data = {
        "name": "New Report",
        "description": "New description",
        "file_path": report_file,
        "is_archived": False,
        # added_by is read_only → not in data
    }

    serializer = ReportSerializer(data=data)
    assert serializer.is_valid(), serializer.errors

    new_report = serializer.save(added_by=user)

    assert new_report.id is not None
    assert new_report.name == "New Report"
    assert new_report.description == "New description"
    assert new_report.is_archived is False
    assert new_report.added_by == user
    file_name = new_report.file_path.name
    assert file_name.startswith("reports/")  # stored in the right folder
    assert file_name.endswith(".pdf")   


def test_report_serializer_validation_missing_name(user, report_file):
    """
    'name' is required, so omitting it should fail validation.
    """
    data = {
        # "name" missing
        "description": "No name here",
        "file_path": report_file,
        "is_archived": False,
    }

    serializer = ReportSerializer(data=data)
    assert not serializer.is_valid()
    assert "name" in serializer.errors
