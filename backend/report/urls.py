from django.urls import path
from .views import (
    CreateReportView,
    ListMyReportsView,
    GetReportDetailView,
    UploadReportVersionView,
    SubmitVersionForReviewView,
    ListPendingVersionsView,
    ReviewVersionView,
    AddCommentView,
    ResolveCommentView,
    AssignFinalGradeView,
)

urlpatterns = [
    # Report Management
    path('reports/create/', CreateReportView.as_view(), name='create-report'),
    path('reports/my-reports/', ListMyReportsView.as_view(), name='list-my-reports'),
    path('reports/<int:id>/', GetReportDetailView.as_view(), name='get-report-detail'),
    
    # Version Management
    path('reports/<int:report_id>/upload-version/', UploadReportVersionView.as_view(), name='upload-report-version'),
    path('reports/versions/submit/', SubmitVersionForReviewView.as_view(), name='submit-version-for-review'),
    
    # Teacher Review
    path('reports/versions/pending/', ListPendingVersionsView.as_view(), name='list-pending-versions'),
    path('reports/versions/<int:version_id>/review/', ReviewVersionView.as_view(), name='review-version'),
    
    # Comments
    path('reports/versions/<int:version_id>/comment/', AddCommentView.as_view(), name='add-comment'),
    path('reports/comments/<int:comment_id>/resolve/', ResolveCommentView.as_view(), name='resolve-comment'),
    
    # Grading
    path('reports/<int:report_id>/assign-grade/', AssignFinalGradeView.as_view(), name='assign-final-grade'),
]