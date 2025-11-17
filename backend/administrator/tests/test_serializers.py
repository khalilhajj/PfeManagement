import pytest
from django.contrib.auth import get_user_model

from authentication.models import Role
from administrator.Serializers import (
    RoleSerializer,
    UserListSerializer,
    UserDetailSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def admin_role():
    """Ensure a single Administrator role exists."""
    role, _ = Role.objects.get_or_create(name="Administrator")
    return role


@pytest.fixture
def user(admin_role):
    """Base user with an Administrator role (for list/detail serializers)."""
    User = get_user_model()
    u = User.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="UserPass123!",
        first_name="Test",
        last_name="User",
        is_active=True,
    )
    u.role = admin_role
    u.save()
    return u



# RoleSerializer
def test_role_serializer(admin_role):
    serializer = RoleSerializer(admin_role)
    data = serializer.data

    assert data["id"] == admin_role.id
    assert data["name"] == "Administrator"



# UserListSerializer
def test_user_list_serializer(user, admin_role):
    serializer = UserListSerializer(user)
    data = serializer.data

    assert data["id"] == user.id
    assert data["username"] == "testuser"
    assert data["email"] == "testuser@example.com"
    assert data["role"] == admin_role.id
    assert data["role_name"] == admin_role.name
    assert "date_joined" in data



# UserDetailSerializer
def test_user_detail_serializer(user, admin_role):
    serializer = UserDetailSerializer(user)
    data = serializer.data

    assert data["id"] == user.id
    assert data["username"] == "testuser"
    assert data["email"] == "testuser@example.com"
    assert data["role"] == admin_role.id
    assert data["role_name"] == admin_role.name
    assert "last_login" in data
    assert "is_staff" in data


# UserCreateSerializer
def test_user_create_serializer_success(admin_role):
    User = get_user_model()
    initial_count = User.objects.count()

    data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "StrongPass123!",
        "password_confirm": "StrongPass123!",
        "first_name": "New",
        "last_name": "User",
        "phone": "123456789",
        "role": admin_role.id,
        "is_active": True,
    }

    serializer = UserCreateSerializer(data=data)
    assert serializer.is_valid(), serializer.errors

    user = serializer.save()

    # user created
    assert User.objects.count() == initial_count + 1
    assert user.username == "newuser"
    assert user.email == "newuser@example.com"
    assert user.role == admin_role
    # password hashed
    assert user.check_password("StrongPass123!")


def test_user_create_serializer_username_unique(admin_role, user):
    data = {
        "username": "testuser",  # already used by fixture 'user'
        "email": "other@example.com",
        "password": "StrongPass123!",
        "password_confirm": "StrongPass123!",
        "first_name": "X",
        "last_name": "Y",
        "role": admin_role.id,
        "is_active": True,
    }

    serializer = UserCreateSerializer(data=data)
    assert not serializer.is_valid()
    assert "username" in serializer.errors


def test_user_create_serializer_email_unique(admin_role, user):
    data ={
        "username": "anotheruser",
        "email": "testuser@example.com",  # already used by fixture 'user'
        "password": "StrongPass123!",
        "password_confirm": "StrongPass123!",
        "first_name": "X",
        "last_name": "Y",
        "role": admin_role.id,
        "is_active": True,
    }

    serializer = UserCreateSerializer(data=data)
    assert not serializer.is_valid()
    assert "email" in serializer.errors


def test_user_create_serializer_password_mismatch(admin_role):
    data = {
        "username": "user3",
        "email": "user3@example.com",
        "password": "StrongPass123!",
        "password_confirm": "WrongPass123!",
        "first_name": "X",
        "last_name": "Y",
        "role": admin_role.id,
        "is_active": True,
    }

    serializer = UserCreateSerializer(data=data)
    assert not serializer.is_valid()
    # Field-level validation error under 'password_confirm'
    assert "password_confirm" in serializer.errors or "__all__" in serializer.errors



# UserUpdateSerializer
@pytest.fixture
def second_user(admin_role):
    User = get_user_model()
    u = User.objects.create_user(
        username="seconduser",
        email="second@example.com",
        password="UserPass123!",
        first_name="Second",
        last_name="User",
        is_active=True,
    )
    u.role = admin_role
    u.save()
    return u


def test_user_update_serializer_email_unique(user, second_user):
    """
    Trying to set second_user.email to user.email must fail.
    """
    data = {
        "email": user.email,  # already used by 'user'
    }
    serializer = UserUpdateSerializer(instance=second_user, data=data, partial=True)
    assert not serializer.is_valid()
    assert "email" in serializer.errors


def test_user_update_serializer_success(user, admin_role):
    data = {
        "email": "updated@example.com",
        "first_name": "Updated",
    }
    serializer = UserUpdateSerializer(instance=user, data=data, partial=True)
    assert serializer.is_valid(), serializer.errors

    updated = serializer.save()
    assert updated.email == "updated@example.com"
    assert updated.first_name == "Updated"


# ChangePasswordSerializer
def test_change_password_serializer_success():
    data = {
        "new_password": "NewStrongPass123!",
        "new_password_confirm": "NewStrongPass123!",
    }
    serializer = ChangePasswordSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data["new_password"] == "NewStrongPass123!"


def test_change_password_serializer_mismatch():
    data = {
        "new_password": "NewStrongPass123!",
        "new_password_confirm": "WrongPass123!",
    }
    serializer = ChangePasswordSerializer(data=data)
    assert not serializer.is_valid()
    assert "new_password_confirm" in serializer.errors or "__all__" in serializer.errors
