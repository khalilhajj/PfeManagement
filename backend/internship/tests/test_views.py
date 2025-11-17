import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from authentication.models import Role
from internship.models import Internship, TeacherInvitation

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


# --------- ROLES ---------

@pytest.fixture
def role_student():
    return Role.objects.get_or_create(name="Student")[0]


@pytest.fixture
def role_teacher():
    return Role.objects.get_or_create(name="Teacher")[0]


@pytest.fixture
def role_admin():
    return Role.objects.get_or_create(name="Administrator")[0]


# --------- USERS ---------

@pytest.fixture
def student_user(role_student):
    User = get_user_model()
    u = User.objects.create_user(
        username="student",
        email="student@example.com",
        password="StudentPass123!",
        first_name="Stu",
        last_name="Dent",
        is_active=True,
    )
    u.role = role_student
    u.save()
    return u


@pytest.fixture
def teacher_user(role_teacher):
    User = get_user_model()
    u = User.objects.create_user(
        username="teacher",
        email="teacher@example.com",
        password="TeacherPass123!",
        first_name="Tea",
        last_name="Cher",
        is_active=True,
    )
    u.role = role_teacher
    u.save()
    return u


@pytest.fixture
def admin_user(role_admin):
    User = get_user_model()
    u = User.objects.create_user(
        username="admin",
        email="admin@example.com",
        password="AdminPass123!",
        first_name="Ad",
        last_name="Min",
        is_active=True,
    )
    u.role = role_admin
    u.save()
    return u


@pytest.fixture
def other_user():
    """Authenticated user with no special role (or wrong role)."""
    User = get_user_model()
    return User.objects.create_user(
        username="other",
        email="other@example.com",
        password="OtherPass123!",
        first_name="Oth",
        last_name="Er",
        is_active=True,
    )


# --------- FILE & INTERNSHIP HELPERS ---------

@pytest.fixture
def cahier_file():
    return SimpleUploadedFile(
        "specs.pdf",
        b"%PDF-1.4 test content",
        content_type="application/pdf",
    )


@pytest.fixture
def student_internship(student_user, cahier_file):
    return Internship.objects.create(
        student_id=student_user,
        teacher_id=None,
        type="PFE",
        company_name="Test Company",
        cahier_de_charges=cahier_file,
        status=0,  # Pending
        start_date="2025-01-01",
        end_date="2025-03-01",
        description="Test internship",
        title="PFE Project",
    )


@pytest.fixture
def teacher_invitation(student_internship, student_user, teacher_user):
    return TeacherInvitation.objects.create(
        internship=student_internship,
        student=student_user,
        teacher=teacher_user,
        status=0,
        message="Please supervise my internship.",
    )


# ===========================================================
# CreateInternshipView
# ===========================================================

def test_create_internship_student(api_client, student_user, cahier_file):
    api_client.force_authenticate(user=student_user)
    url = reverse("create-internship")
    data = {
        "type": "PFE",
        "company_name": "New Company",
        "cahier_de_charges": cahier_file,
        "start_date": "2025-01-01",
        "end_date": "2025-02-01",
        "description": "My PFE",
        "title": "Awesome PFE",
    }
    response = api_client.post(url, data, format="multipart")
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["student_id"] == student_user.id
    assert response.data["company_name"] == "New Company"


def test_create_internship_non_student_forbidden(api_client, teacher_user, cahier_file):
    api_client.force_authenticate(user=teacher_user)
    url = reverse("create-internship")
    data = {
        "type": "PFE",
        "company_name": "New Company",
        "cahier_de_charges": cahier_file,
        "start_date": "2025-01-01",
        "end_date": "2025-02-01",
        "description": "My PFE",
        "title": "Awesome PFE",
    }
    response = api_client.post(url, data, format="multipart")
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ===========================================================
# GetStudentInternshipsView
# ===========================================================

def test_get_student_internships(api_client, student_user, student_internship):
    api_client.force_authenticate(user=student_user)
    url = reverse("my-internships")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["id"] == student_internship.id


# ===========================================================
# GetInternshipDetailView
# ===========================================================

def test_get_internship_detail_owner(api_client, student_user, student_internship):
    api_client.force_authenticate(user=student_user)
    url = reverse("internship-detail", args=[student_internship.id])
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == student_internship.id


def test_get_internship_detail_teacher_assigned(
    api_client, teacher_user, student_internship
):
    # assign teacher
    student_internship.teacher_id = teacher_user
    student_internship.save()

    api_client.force_authenticate(user=teacher_user)
    url = reverse("internship-detail", args=[student_internship.id])
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK


def test_get_internship_detail_forbidden_for_other_user(
    api_client, other_user, student_internship
):
    api_client.force_authenticate(user=other_user)
    url = reverse("internship-detail", args=[student_internship.id])
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ===========================================================
# ListTeachersView
# ===========================================================

def test_list_teachers(api_client, teacher_user, role_teacher):
    api_client.force_authenticate(user=teacher_user)  # any authenticated user
    url = reverse("list-teachers")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1
    assert response.data[0]["role_name"] == "Teacher"


def test_list_teachers_role_not_found(api_client, other_user):
    # Ensure there is NO Teacher role
    Role.objects.filter(name="Teacher").delete()

    api_client.force_authenticate(user=other_user)
    url = reverse("list-teachers")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND


# ===========================================================
# SendTeacherInvitationView
# ===========================================================

def test_send_teacher_invitation_success(
    api_client, student_user, student_internship, teacher_user
):
    api_client.force_authenticate(user=student_user)
    url = reverse("send-invitation")
    data = {
        "internship": student_internship.id,
        "teacher": teacher_user.id,
        "message": "Please supervise my internship.",
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["teacher"] == teacher_user.id
    assert response.data["internship"] == student_internship.id


def test_send_teacher_invitation_non_student_forbidden(
    api_client, teacher_user, student_internship):
    api_client.force_authenticate(user=teacher_user)
    url = reverse("send-invitation")
    data = {
        "internship": student_internship.id,
        "teacher": teacher_user.id,
        "message": "Should be forbidden.",
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_send_teacher_invitation_not_own_internship(
    api_client, student_user, teacher_user, cahier_file
):
    # create internship for another student
    User = get_user_model()
    other_student = User.objects.create_user(
        username="otherstudent",
        email="otherstudent@example.com",
        password="OtherStudent123!",
    )
    other_student.role = Role.objects.get_or_create(name="Student")[0]
    other_student.save()

    internship = Internship.objects.create(
        student_id=other_student,
        teacher_id=None,
        type="PFE",
        company_name="Other Company",
        cahier_de_charges=cahier_file,
        status=0,
        start_date="2025-01-01",
        end_date="2025-03-01",
        title="Other PFE",
    )

    api_client.force_authenticate(user=student_user)
    url = reverse("send-invitation")
    data = {
        "internship": internship.id,
        "teacher": teacher_user.id,
        "message": "Trying to send for someone else.",
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ===========================================================
# GetStudentInvitationsView
# ===========================================================

def test_get_student_invitations(api_client, student_user, teacher_invitation):
    api_client.force_authenticate(user=student_user)
    url = reverse("my-invitations")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["id"] == teacher_invitation.id


# ===========================================================
# RespondToInvitationView
# ===========================================================

def test_teacher_accepts_invitation(
    api_client, teacher_user, teacher_invitation
):
    api_client.force_authenticate(user=teacher_user)
    url = reverse("respond-invitation", args=[teacher_invitation.id])
    data = {"status": 1}  # Accept
    response = api_client.patch(url, data, format="json")
    assert response.status_code == status.HTTP_200_OK
    teacher_invitation.refresh_from_db()
    assert teacher_invitation.status == 1
    internship = teacher_invitation.internship
    internship.refresh_from_db()
    assert internship.teacher_id == teacher_user
    assert internship.status == 1  # Approved


def test_teacher_rejects_invitation(
    api_client, teacher_user, teacher_invitation
):
    api_client.force_authenticate(user=teacher_user)
    url = reverse("respond-invitation", args=[teacher_invitation.id])
    data = {"status": 2}  # Reject
    response = api_client.patch(url, data, format="json")
    assert response.status_code == status.HTTP_200_OK
    teacher_invitation.refresh_from_db()
    assert teacher_invitation.status == 2


def test_respond_invitation_non_teacher_forbidden(
    api_client, student_user, teacher_invitation
):
    api_client.force_authenticate(user=student_user)
    url = reverse("respond-invitation", args=[teacher_invitation.id])
    data = {"status": 1}
    response = api_client.patch(url, data, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ===========================================================
# GetPendingInternshipsView / Approve / Reject
# ===========================================================

def test_get_pending_internships_admin_only(
    api_client, admin_user, student_internship
):
    api_client.force_authenticate(user=admin_user)
    url = reverse("pending-internships")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1


def test_get_pending_internships_non_admin_forbidden(
    api_client, student_user, student_internship
):
    api_client.force_authenticate(user=student_user)
    url = reverse("pending-internships")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_approve_internship(api_client, admin_user, student_internship):
    api_client.force_authenticate(user=admin_user)
    url = reverse("approve-internship", args=[student_internship.id])
    response = api_client.patch(url, {}, format="json")
    assert response.status_code == status.HTTP_200_OK
    student_internship.refresh_from_db()
    assert student_internship.status == 1  # Approved


def test_reject_internship(api_client, admin_user, student_internship):
    api_client.force_authenticate(user=admin_user)
    url = reverse("reject-internship", args=[student_internship.id])
    response = api_client.patch(url, {"reason": "No fit"}, format="json")
    assert response.status_code == status.HTTP_200_OK
    student_internship.refresh_from_db()
    assert student_internship.status == 2  # Rejected


# ===========================================================
# GetTeacherInvitationsView
# ===========================================================

def test_get_teacher_invitations(api_client, teacher_user, teacher_invitation):
    api_client.force_authenticate(user=teacher_user)
    url = reverse("teacher-invitations")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["id"] == teacher_invitation.id


def test_get_teacher_invitations_non_teacher_forbidden(
    api_client, student_user, teacher_invitation
):
    api_client.force_authenticate(user=student_user)
    url = reverse("teacher-invitations")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN
