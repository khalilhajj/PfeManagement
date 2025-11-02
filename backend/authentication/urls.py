from django.urls import path
from .views import LoginView,AddUserView,GetUserView


urlpatterns = [
        path('login/', LoginView.as_view(), name='login'),
        path('add-user/', AddUserView.as_view(), name='add-user'),
        path('get-user/', GetUserView.as_view(), name='get-user'),
]