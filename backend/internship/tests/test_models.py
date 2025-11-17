# internship/tests/test_models.py

import pytest
from datetime import date, time

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError

from authentication.models import Role
from internship.models import Internship, TeacherInvitation, Soutenance, Jury

User = get_user_model()


# ---------- ROLE FIXTURES ----------

@pytest.fixture
def student_role(db):
    role, _ = Role.objects.get_or_create(name="student")
    return role


@pytest.fixture
def teacher_role(db):
    role, _ = Role.objects.get_or_create(name="teacher")
    return role


# ---------- USER FIXTURES ----------

@pytest.fixture
def student_user(db, student_role):
    return User.objects.create_user(
        username="student",
        email="student@example.com",
        password="password",
        role=student_role,
    )


@pytest.fixture
def teacher_user(db, teacher_role):
    return User.objects.create_user(
        username="teacher",
        email="teacher@example.com",
        password="password",
        role=teacher_role,
    )


@pytest.fixture
def jury_member_user(db, teacher_role):
    return User.objects.create_user(
        username="jury_member",
        email="jury@example.com",
        password="password",
        role=teacher_role,
    )


# ---------- FILE FIXTURE ----------

@pytest.fixture
def cahier_pdf():
    return SimpleUploadedFile(
        "cahier.pdf",
        b"Dummy PDF content",
        content_type="application/pdf",
    )


# ---------- INTERNSHIP FIXTURE ----------

@pytest.fixture
def internship(db, student_user, teacher_user, cahier_pdf):
    return Internship.objects.create(
        student_id=student_user,
        teacher_id=teacher_user,
        type="PFE",
        company_name="My Company",
        cahier_de_charges=cahier_pdf,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 6, 1),
        title="My Internship",
        description="Some description",
        # status has default = 0 (Pending)
    )


# =========================
#   INTERNSHIP TESTS
# =========================

def test_internship_str(internship):
    assert str(internship) == "My Internship"


def test_internship_default_status_and_display(student_user, cahier_pdf):
    intern = Internship.objects.create(
        student_id=student_user,
        teacher_id=None,
        type="Stage",
        company_name="Other Company",
        cahier_de_charges=cahier_pdf,
        start_date=date(2025, 2, 1),
        end_date=date(2025, 3, 1),
        title="Stage Title",
    )
    assert intern.status == 0
    assert intern.get_status_display() == "Pending"


def test_internship_ordering_by_created_at(student_user, teacher_user, cahier_pdf):
    older = Internship.objects.create(
        student_id=student_user,
        teacher_id=teacher_user,
        type="PFE",
        company_name="Old",
        cahier_de_charges=cahier_pdf,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 2, 1),
        title="Old Internship",
    )

    newer = Internship.objects.create(
        student_id=student_user,
        teacher_id=teacher_user,
        type="PFE",
        company_name="New",
        cahier_de_charges=cahier_pdf,
        start_date=date(2025, 2, 1),
        end_date=date(2025, 3, 1),
        title="New Internship",
    )

    internships = list(Internship.objects.all())
    # ordering = ['-created_at'] -> newest first
    assert internships[0] == newer
    assert internships[1] == older


def test_internship_related_names(student_user, teacher_user, cahier_pdf):
    intern = Internship.objects.create(
        student_id=student_user,
        teacher_id=teacher_user,
        type="PFE",
        company_name="Rel Company",
        cahier_de_charges=cahier_pdf,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 2, 1),
        title="Rel Internship",
    )

    # related_name='internships' on student_id
    assert intern in student_user.internships.all()

    # related_name='assigned_internships' on teacher_id
    assert intern in teacher_user.assigned_internships.all()


# =========================
#   TEACHER INVITATION TESTS
# =========================

@pytest.fixture
def teacher_invitation(db, internship, student_user, teacher_user):
    return TeacherInvitation.objects.create(
        internship=internship,
        student=student_user,
        teacher=teacher_user,
    )


def test_teacher_invitation_str(teacher_invitation, student_user, teacher_user):
    expected = f"Invitation from {student_user.username} to {teacher_user.username}"
    assert str(teacher_invitation) == expected


def test_teacher_invitation_default_status_and_display(internship, student_user, teacher_user):
    inv = TeacherInvitation.objects.create(
        internship=internship,
        student=student_user,
        teacher=teacher_user,
    )
    assert inv.status == 0
    assert inv.get_status_display() == "Pending"


def test_teacher_invitation_unique_together(internship, student_user, teacher_user):
    TeacherInvitation.objects.create(
        internship=internship,
        student=student_user,
        teacher=teacher_user,
    )

    with pytest.raises(IntegrityError):
        TeacherInvitation.objects.create(
            internship=internship,
            student=student_user,
            teacher=teacher_user,
        )


def test_teacher_invitation_related_names(internship, student_user, teacher_user):
    inv = TeacherInvitation.objects.create(
        internship=internship,
        student=student_user,
        teacher=teacher_user,
    )

    # related_name='sent_invitations' on student
    assert inv in student_user.sent_invitations.all()
    # related_name='received_invitations' on teacher
    assert inv in teacher_user.received_invitations.all()
    # related_name='invitations' on internship
    assert inv in internship.invitations.all()


# =========================
#   SOUTENANCE TESTS
# =========================

@pytest.fixture
def soutenance(db, internship):
    return Soutenance.objects.create(
        internship=internship,
        date=date(2025, 7, 1),
        time=time(9, 0),
        room="Room A",
        # grade is optional
    )


def test_soutenance_str(soutenance, internship):
    expected = f"Soutenance for {internship.title} on {soutenance.date} at {soutenance.time}"
    assert str(soutenance) == expected


def test_soutenance_grade_optional(internship):
    s = Soutenance.objects.create(
        internship=internship,
        date=date(2025, 7, 1),
        time=time(9, 0),
        room="Room A",
    )
    assert s.grade is None

    s.grade = 15.5
    s.save()
    s.refresh_from_db()
    assert s.grade == 15.5


def test_soutenance_related_name(internship, soutenance):
    assert soutenance in internship.soutenances.all()


# =========================
#   JURY TESTS
# =========================

@pytest.fixture
def jury(db, soutenance, jury_member_user):
    return Jury.objects.create(
        soutenance=soutenance,
        member=jury_member_user,
    )

def test_jury_str(jury, soutenance, jury_member_user):
    expected = f"Jury member {jury_member_user} for {soutenance}"
    assert str(jury) == expected


def test_jury_related_names(soutenance, jury_member_user, jury):
    # related_name='juries' on Soutenance
    assert jury in soutenance.juries.all()
    # related_name='jury_memberships' on User
    assert jury in jury_member_user.jury_memberships.all()
