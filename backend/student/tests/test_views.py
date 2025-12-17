import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

from rest_framework.test import APIClient
from rest_framework import status

from report.models import Report

pytestmark = pytest.mark.django_db


@pytest.fixture
def user():
    User = get_user_model()
    return User.objects.create_user(
        username="student_user",
        email="student@example.com",
        password="StrongPass123!",
    )


@pytest.fixture
def auth_client(user):
    """
    APIClient authenticated as our test user.
    """
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def pdf_file():
    """
    Simple in-memory PDF file for upload tests.
    """
    return SimpleUploadedFile(
        "report.pdf",
        b"%PDF-1.4 test content",
        content_type="application/pdf",
    )


@pytest.fixture
def archived_report(user):
    """
    One archived report in DB.
    """
    return Report.objects.create(
        name="Archived Report",
        description="Archived description",
        file_path="reports/archived.pdf",
        is_archived=True,
        added_by=user,
    )


@pytest.fixture
def non_archived_report(user):
    """
    One non-archived report in DB (should NOT be returned by GET).
    """
    return Report.objects.create(
        name="Active Report",
        description="Active description",
        file_path="reports/active.pdf",
        is_archived=False,
        added_by=user,
    )


def test_get_reports_authenticated(auth_client, archived_report, non_archived_report):
    """
    GET /student/reports/ should return only archived reports
    when the user is authenticated.
    """
    url = reverse("reports")

    response = auth_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    # Only the archived report should be returned
    assert isinstance(response.data, list)
    assert len(response.data) == 1
    assert response.data[0]["id"] == archived_report.id
    assert response.data[0]["is_archived"] is True


def test_get_reports_unauthenticated(archived_report):
    """
    Unauthenticated GET should be rejected by IsAuthenticated.
    """
    client = APIClient()
    url = reverse("reports")

    response = client.get(url)

    # Depending on authentication setup, DRF may return 401 or 403.
    assert response.status_code in [
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    ]


def test_post_report_success(auth_client, pdf_file, user):
    """
    Authenticated user can POST a new report with a PDF file.
    """
    url = reverse("reports")
    data = {
        "name": "New Report",
        "description": "New description",
        "file_path": pdf_file,
        "is_archived": False,
    }

    response = auth_client.post(url, data, format="multipart")

    assert response.status_code == status.HTTP_201_CREATED
    # Check database content
    assert Report.objects.count() == 1
    report = Report.objects.first()
    assert report.name == "New Report"
    assert report.description == "New description"
    assert report.is_archived is False
    assert report.added_by == user
    # File path is stored under upload_to='reports/'
    assert report.file_path.name.startswith("reports/")
    assert report.file_path.name.endswith(".pdf")


def test_post_report_unauthenticated(pdf_file):
    """
    Unauthenticated POST should be rejected.
    """
    client = APIClient()
    url = reverse("reports")
    data = {
        "name": "New Report",
        "description": "Should fail",
        "file_path": pdf_file,
        "is_archived": False,
    }

    response = client.post(url, data, format="multipart")

    assert response.status_code in [
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    ]
    assert Report.objects.count() == 0


def test_post_report_invalid_data(auth_client):
    """
    POST with invalid data (missing required 'name') should return 400.
    """
    url = reverse("reports")
    data = {
        # "name" missing
        "description": "No name here",
        # file_path also missing to keep it clearly invalid
        "is_archived": False,
    }

    response = auth_client.post(url, data, format="multipart")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "name" in response.data
