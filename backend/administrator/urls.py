from django.urls import path
from .views import (
    ListUsersView,
    GetUserDetailView,
    CreateUserView,
    UpdateUserView,
    DeleteUserView,
    ResetUserPasswordView,
    ListRolesView,
    GetUserStatsView,
)
from .room_views import (
    ListRoomsView,
    CreateRoomView,
    UpdateRoomView,
    DeleteRoomView,
    GetAvailableRoomsView,
)
from .stats_views import AdminStatisticsView

urlpatterns = [
    path('users/', ListUsersView.as_view(), name='list-users'),
    path('users/<int:id>/', GetUserDetailView.as_view(), name='user-detail'),
    path('users/create/', CreateUserView.as_view(), name='create-user'),
    path('users/<int:id>/update/', UpdateUserView.as_view(), name='update-user'),
    path('users/<int:id>/delete/', DeleteUserView.as_view(), name='delete-user'),
    path('users/<int:id>/reset-password/', ResetUserPasswordView.as_view(), name='reset-password'),
    path('roles/', ListRolesView.as_view(), name='list-roles'),
    path('stats/', GetUserStatsView.as_view(), name='user-stats'),
    
    # Room Management
    path('rooms/', ListRoomsView.as_view(), name='list-rooms'),
    path('rooms/create/', CreateRoomView.as_view(), name='create-room'),
    path('rooms/<int:id>/update/', UpdateRoomView.as_view(), name='update-room'),
    path('rooms/<int:id>/delete/', DeleteRoomView.as_view(), name='delete-room'),
    path('rooms/available/', GetAvailableRoomsView.as_view(), name='available-rooms'),
    
    # Statistics
    path('statistics/', AdminStatisticsView.as_view(), name='admin-statistics'),
]