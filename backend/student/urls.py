from django.urls import path
from .views.cv_views import CVAnalysisView

urlpatterns = [
    path('cv/analyze/', CVAnalysisView.as_view(), name='cv-analysis'),
]
