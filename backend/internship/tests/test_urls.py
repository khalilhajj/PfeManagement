from django.urls import reverse, resolve

from internship.views import (
    CreateInternshipView,
    GetStudentInternshipsView,
    GetInternshipDetailView,
    ListTeachersView,
    SendTeacherInvitationView,
    GetStudentInvitationsView,
    RespondToInvitationView,
    GetPendingInternshipsView,
    ApproveInternshipView,
    RejectInternshipView,
    GetTeacherInvitationsView,
)


def test_create_internship_url_resolves():
    path = reverse("create-internship")
    view = resolve(path)
    assert view.func.view_class is CreateInternshipView


def test_my_internships_url_resolves():
    path = reverse("my-internships")
    view = resolve(path)
    assert view.func.view_class is GetStudentInternshipsView


def test_internship_detail_url_resolves():
    path = reverse("internship-detail", args=[1])
    view = resolve(path)
    assert view.func.view_class is GetInternshipDetailView


def test_list_teachers_url_resolves():
    path = reverse("list-teachers")
    view = resolve(path)
    assert view.func.view_class is ListTeachersView


def test_send_invitation_url_resolves():
    path = reverse("send-invitation")
    view = resolve(path)
    assert view.func.view_class is SendTeacherInvitationView


def test_my_invitations_url_resolves():
    path = reverse("my-invitations")
    view = resolve(path)
    assert view.func.view_class is GetStudentInvitationsView


def test_respond_invitation_url_resolves():
    path = reverse("respond-invitation", args=[1])
    view = resolve(path)
    assert view.func.view_class is RespondToInvitationView


def test_pending_internships_url_resolves():
    path = reverse("pending-internships")
    view = resolve(path)
    assert view.func.view_class is GetPendingInternshipsView


def test_approve_internship_url_resolves():
    path = reverse("approve-internship", args=[1])
    view = resolve(path)
    assert view.func.view_class is ApproveInternshipView


def test_reject_internship_url_resolves():
    path = reverse("reject-internship", args=[1])
    view = resolve(path)
    assert view.func.view_class is RejectInternshipView


def test_teacher_invitations_url_resolves():
    path = reverse("teacher-invitations")
    view = resolve(path)
    assert view.func.view_class is GetTeacherInvitationsView
