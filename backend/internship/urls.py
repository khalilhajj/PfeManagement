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
from .views.company_views import (
    CompanyOfferListCreateView,
    CompanyOfferDetailView,
    CompanyApplicationsView,
    CompanyReviewApplicationView,
    CompanyInterviewDecisionView,
    InterviewSlotListCreateView,
    InterviewSlotDeleteView,
    BrowseOffersView,
    StudentApplyView,
    StudentApplicationsView,
    StudentSelectInterviewSlotView,
    AdminPendingOffersView,
    AdminReviewOfferView,
    CalculateApplicationMatchView,
    BatchCalculateMatchesView
)

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
    
    # Company Internship Offers
    path('offers/', CompanyOfferListCreateView.as_view(), name='company-offers'),
    path('offers/<int:offer_id>/', CompanyOfferDetailView.as_view(), name='company-offer-detail'),
    path('offers/<int:offer_id>/applications/', CompanyApplicationsView.as_view(), name='offer-applications'),
    path('offers/all-applications/', CompanyApplicationsView.as_view(), name='all-applications'),
    path('applications/<int:application_id>/review/', CompanyReviewApplicationView.as_view(), name='review-application'),
    path('applications/<int:application_id>/decision/', CompanyInterviewDecisionView.as_view(), name='interview-decision'),
    
    # Interview Slots Management
    path('offers/<int:offer_id>/slots/', InterviewSlotListCreateView.as_view(), name='interview-slots'),
    path('slots/<int:slot_id>/', InterviewSlotDeleteView.as_view(), name='delete-slot'),
    
    # Student Browse & Apply
    path('browse/', BrowseOffersView.as_view(), name='browse-offers'),
    path('apply/', StudentApplyView.as_view(), name='apply-offer'),
    path('my-applications/', StudentApplicationsView.as_view(), name='my-applications'),
    path('applications/<int:application_id>/select-slot/', StudentSelectInterviewSlotView.as_view(), name='select-slot'),
    
    # Admin Review Offers
    path('admin/offers/', AdminPendingOffersView.as_view(), name='admin-pending-offers'),
    path('admin/offers/<int:offer_id>/review/', AdminReviewOfferView.as_view(), name='admin-review-offer'),
    
    # AI Matching
    path('applications/<int:application_id>/calculate-match/', CalculateApplicationMatchView.as_view(), name='calculate-match'),
    path('offers/<int:offer_id>/batch-calculate-matches/', BatchCalculateMatchesView.as_view(), name='batch-calculate-matches'),
]