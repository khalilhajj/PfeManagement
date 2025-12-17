from django.urls import path
from .views import ActivateAccountView, LoginView,AddUserView,GetUserView,UpdateUserView, DeleteAccountView,ChangePasswordView


urlpatterns = [
        path('login/', LoginView.as_view(), name='login'),
        path('add-user/', AddUserView.as_view(), name='add-user'),
        path('get-user/', GetUserView.as_view(), name='get-user'),
        path('profile/update/', UpdateUserView.as_view(), name='update-profile'),
        path('profile/delete/', DeleteAccountView.as_view(), name='delete-account'),
        path('password/change/', ChangePasswordView.as_view(), name='change-password'),
        path('activate/<str:token>/', ActivateAccountView.as_view(), name='activate-account'),  # New

]