import pytest
from django.urls import reverse, resolve

from administrator.views import (
    ListUsersView,
    GetUserDetailView,
    CreateUserView,
    UpdateUserView,
    DeleteUserView,
    ResetUserPasswordView,
    ListRolesView,
    GetUserStatsView,
)



def test_list_users_url_resolves():
    path = reverse("list-users")
    view = resolve(path)
    assert view.func.view_class is ListUsersView


def test_user_detail_url_resolves():
    path = reverse("user-detail", args=[1])
    view = resolve(path)
    assert view.func.view_class is GetUserDetailView


def test_create_user_url_resolves():
    path = reverse("create-user")
    view = resolve(path)
    assert view.func.view_class is CreateUserView


def test_update_user_url_resolves():
    path = reverse("update-user", args=[1])
    view = resolve(path)
    assert view.func.view_class is UpdateUserView


def test_delete_user_url_resolves():
    path = reverse("delete-user", args=[1])
    view = resolve(path)
    assert view.func.view_class is DeleteUserView


def test_reset_password_url_resolves():
    path = reverse("reset-password", args=[1])
    view = resolve(path)
    assert view.func.view_class is ResetUserPasswordView


def test_list_roles_url_resolves():
    path = reverse("list-roles")
    view = resolve(path)
    assert view.func.view_class is ListRolesView


def test_user_stats_url_resolves():
    path = reverse("user-stats")
    view = resolve(path)
    assert view.func.view_class is GetUserStatsView
