import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse

from authentication.models import Role

# Allow DB access in all tests in this module
pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_role():
    """
    Ensure there is an 'Administrator' role.
    Use get_or_create to avoid unique constraint issues on name.
    """
    role, _ = Role.objects.get_or_create(name="Administrator")
    return role


@pytest.fixture
def admin_user(admin_role):
    """
    Admin user with role.name == 'Administrator'
    so it passes the checks in the views.
    """
    User = get_user_model()
    user = User.objects.create_user(
        username="adminuser",
        email="adminuser@example.com",
        password="AdminPass123!",
        first_name="Admin",
        last_name="User",
        is_active=True,
    )
    user.role = admin_role
    user.save()
    return user


@pytest.fixture
def regular_user():
    """Non-admin user (no admin role)."""
    User = get_user_model()
    return User.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="UserPass123!",
        first_name="Test",
        last_name="User",
        is_active=True,
    )


# ListUsersView
def test_list_users_admin(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse("list-users")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK


def test_list_users_non_admin(api_client, regular_user):
    api_client.force_authenticate(user=regular_user)
    url = reverse("list-users")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN



# GetUserDetailView
def test_get_user_detail(api_client, admin_user, regular_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse("user-detail", args=[regular_user.id])
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == regular_user.id


def test_get_user_detail_non_admin(api_client, regular_user):
    api_client.force_authenticate(user=regular_user)
    url = reverse("user-detail", args=[regular_user.id])
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN



# CreateUserView
def test_create_user_admin(api_client, admin_user, admin_role):
    """
    Admin can create a user.
    View uses MultiPartParser & FormParser, so default form-data is OK.
    """
    api_client.force_authenticate(user=admin_user)
    url = reverse("create-user")
    data = {
        "username": "newuser1",
        "email": "newuser1@example.com",
        "password": "StrongPass123!",
        "password_confirm": "StrongPass123!",
        "first_name": "New",
        "last_name": "User",
        "role": admin_role.id,
        "is_active": True,
    }
    response = api_client.post(url, data)  # form-data / multipart
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["data"]["username"] == "newuser1"


def test_create_user_non_admin(api_client, regular_user):
    api_client.force_authenticate(user=regular_user)
    url = reverse("create-user")
    data = {
        "username": "newuser2",
        "email": "newuser2@example.com",
        "password": "StrongPass123!",
        "password_confirm": "StrongPass123!",
        "first_name": "New",
        "last_name": "User",
        "is_active": True,
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_403_FORBIDDEN


# UpdateUserView
def test_update_user_admin(api_client, admin_user, regular_user):
    """
    Admin updates another user.
    """
    api_client.force_authenticate(user=admin_user)
    url = reverse("update-user", args=[regular_user.id])
    data = {
        "first_name": "UpdatedName",
    }
    response = api_client.patch(url, data)  
    assert response.status_code == status.HTTP_200_OK
    assert response.data["data"]["first_name"] == "UpdatedName"


def test_update_user_non_admin(api_client, regular_user):
    api_client.force_authenticate(user=regular_user)
    url = reverse("update-user", args=[regular_user.id])
    data = {"first_name": "ShouldNotUpdate"}
    response = api_client.patch(url, data)
    assert response.status_code == status.HTTP_403_FORBIDDEN


# DeleteUserView
def test_delete_user_admin(api_client, admin_user, regular_user):
    """
    Admin deletes another user (soft delete, not themselves).
    """
    api_client.force_authenticate(user=admin_user)
    url = reverse("delete-user", args=[regular_user.id])
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_200_OK


def test_delete_user_non_admin(api_client, regular_user):
    api_client.force_authenticate(user=regular_user)
    url = reverse("delete-user", args=[regular_user.id])
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN



# ResetUserPasswordView
def test_reset_user_password_admin(api_client, admin_user, regular_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse("reset-password", args=[regular_user.id])
    data = {
        "new_password": "NewStrongPass123!",
        "new_password_confirm": "NewStrongPass123!",
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_200_OK


# GetUserStatsView
def test_get_user_stats(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse("user-stats")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert "total_users" in response.data
    assert "active_users" in response.data
    assert "inactive_users" in response.data
    assert "users_by_role" in response.data
