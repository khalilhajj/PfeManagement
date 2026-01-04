from django.urls import path
from .views import (
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
    NotificationListView, 
    MarkNotificationReadView, 
    MarkAllNotificationsReadView
)
from .views.soutenance_views import SoutenanceListCreateView, SoutenanceDetailView, GetSoutenanceCandidatesView

urlpatterns = [
    path('create/', CreateInternshipView.as_view(), name='create-internship'),
    path('my-internships/', GetStudentInternshipsView.as_view(), name='my-internships'),
    path('<int:id>/', GetInternshipDetailView.as_view(), name='internship-detail'),
    path('teachers/', ListTeachersView.as_view(), name='list-teachers'),
    path('invite/', SendTeacherInvitationView.as_view(), name='send-invitation'),
    path('invitations/', GetStudentInvitationsView.as_view(), name='my-invitations'),
    path('invitation/<int:id>/respond/', RespondToInvitationView.as_view(), name='respond-invitation'),
    path('admin/pending/', GetPendingInternshipsView.as_view(), name='pending-internships'),
    path('admin/<int:id>/approve/', ApproveInternshipView.as_view(), name='approve-internship'),
    path('admin/<int:id>/reject/', RejectInternshipView.as_view(), name='reject-internship'),
    path('teacher/invitations/', GetTeacherInvitationsView.as_view(), name='teacher-invitations'),
    path('soutenances/', SoutenanceListCreateView.as_view(), name='soutenance-list'),
    path('soutenances/candidates/', GetSoutenanceCandidatesView.as_view(), name='soutenance-candidates'),
    path('soutenances/<int:pk>/', SoutenanceDetailView.as_view(), name='soutenance-detail'),
    
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-read'),
    path('notifications/read-all/', MarkAllNotificationsReadView.as_view(), name='notification-read-all'),
]