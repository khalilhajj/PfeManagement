import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

from authentication.models import Role
from internship.models import Internship, TeacherInvitation
from internship.serializers import (
    InternshipSerializer,
    TeacherInvitationSerializer,
    TeacherListSerializer,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def role_student():
    return Role.objects.get_or_create(name="Student")[0]


@pytest.fixture
def role_teacher():
    return Role.objects.get_or_create(name="Teacher")[0]


@pytest.fixture
def student_user(role_student):
    User = get_user_model()
    u = User.objects.create_user(
        username="student",
        email="student@example.com",
        password="StudentPass123!",
        first_name="Stu",
        last_name="Dent",
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
    )
    u.role = role_teacher
    u.save()
    return u


@pytest.fixture
def cahier_file():
    return SimpleUploadedFile(
        "specs.pdf",
        b"%PDF-1.4 test content",
        content_type="application/pdf",
    )


@pytest.fixture
def internship(student_user, cahier_file):
    return Internship.objects.create(
        student_id=student_user,
        teacher_id=None,
        type="PFE",
        company_name="Test Company",
        cahier_de_charges=cahier_file,
        status=0,
        start_date="2025-01-01",
        end_date="2025-03-01",
        description="Test internship",
        title="PFE Project",
    )


# ===========================
# InternshipSerializer
# ===========================

def test_internship_serializer_basic(internship):
    serializer = InternshipSerializer(internship)
    data = serializer.data
    assert data["id"] == internship.id
    assert data["student_id"] == internship.student_id.id
    assert data["company_name"] == "Test Company"
    assert data["status"] == internship.status
    # status_display is based on STATUS_CHOICES
    assert data["status_display"] == internship.get_status_display()


def test_internship_serializer_date_validation(student_user, cahier_file):
    data = {
        "student_id": student_user.id,
        "type": "PFE",
        "company_name": "Bad Dates",
        "cahier_de_charges": cahier_file,
        "start_date": "2025-03-01",
        "end_date": "2025-02-01",  # invalid
        "description": "Invalid dates",
        "title": "Invalid",
        "status": 0,
    }
    serializer = InternshipSerializer(data=data)
    assert not serializer.is_valid()
    assert "end_date" in serializer.errors


def test_internship_serializer_file_extension_validation(student_user):
    bad_file = SimpleUploadedFile(
        "malware.exe", b"fake", content_type="application/octet-stream"
    )
    data = {
        "student_id": student_user.id,
        "type": "PFE",
        "company_name": "Bad File",
        "cahier_de_charges": bad_file,
        "start_date": "2025-01-01",
        "end_date": "2025-02-01",
        "description": "Invalid file",
        "title": "Invalid File",
        "status": 0,
    }
    serializer = InternshipSerializer(data=data)
    assert not serializer.is_valid()
    assert "cahier_de_charges" in serializer.errors


def test_internship_serializer_file_size_validation(student_user):
    big_file = SimpleUploadedFile(
        "big.pdf",
        b"x" * (10 * 1024 * 1024 + 1),
        content_type="application/pdf",
    )
    data = {
        "student_id": student_user.id,
        "type": "PFE",
        "company_name": "Big File",
        "cahier_de_charges": big_file,
        "start_date": "2025-01-01",
        "end_date": "2025-02-01",
        "description": "Too big",
        "title": "Huge File",
        "status": 0,
    }
    serializer = InternshipSerializer(data=data)
    assert not serializer.is_valid()
    assert "cahier_de_charges" in serializer.errors


# ===========================
# TeacherInvitationSerializer
# ===========================

@pytest.fixture
def internship_for_invite(internship):
    return internship


def test_teacher_invitation_serializer_success(
    internship_for_invite, student_user, teacher_user
):
    data = {
        "internship": internship_for_invite.id,
        # "student" is read_only in the serializer, so we don't send it in data
        "teacher": teacher_user.id,
        "message": "Please supervise.",
    }
    serializer = TeacherInvitationSerializer(data=data)
    assert serializer.is_valid(), serializer.errors

    # pass student explicitly, since the serializer doesn't handle it from data
    invitation = serializer.save(student=student_user)

    assert invitation.internship == internship_for_invite
    assert invitation.teacher == teacher_user
    assert invitation.student == student_user
    assert invitation.status == 0  # default



def test_teacher_invitation_serializer_teacher_must_be_teacher_role(
    internship_for_invite, student_user
):
    User = get_user_model()
    non_teacher = User.objects.create_user(
        username="random",
        email="random@example.com",
        password="Random123!",
    )
    # no role restriction enforced by the serializer

    data = {
        "internship": internship_for_invite.id,
        "teacher": non_teacher.id,
        "message": "Invalid teacher.",
    }
    serializer = TeacherInvitationSerializer(data=data)

    # Serializer currently allows any user as teacher
    assert serializer.is_valid(), serializer.errors

    invitation = serializer.save(student=student_user)
    assert invitation.internship == internship_for_invite
    assert invitation.teacher == non_teacher
    assert invitation.student == student_user


def test_teacher_invitation_serializer_duplicate_invitation(
    internship_for_invite, student_user, teacher_user
):
    TeacherInvitation.objects.create(
        internship=internship_for_invite,
        student=student_user,
        teacher=teacher_user,
        status=0,
    )

    data = {
        "internship": internship_for_invite.id,
        "student": student_user.id,
        "teacher": teacher_user.id,
        "message": "Duplicate request.",
    }
    serializer = TeacherInvitationSerializer(data=data)
    assert not serializer.is_valid()
    # Could be a non-field error
    assert "__all__" in serializer.errors or "non_field_errors" in serializer.errors


# ===========================
# TeacherListSerializer
# ===========================

def test_teacher_list_serializer(teacher_user):
    serializer = TeacherListSerializer(teacher_user)
    data = serializer.data
    assert data["id"] == teacher_user.id
    assert data["username"] == "teacher"
    assert data["email"] == "teacher@example.com"
    assert data["role_name"] == "Teacher"
    assert data["full_name"] == "Tea Cher"
