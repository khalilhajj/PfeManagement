from django.db import models
from django.contrib.auth.models import AbstractUser
from rest_framework_simplejwt.tokens import RefreshToken

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
    


class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.username
    
    def get_token(self):
        token = RefreshToken.for_user(self)
        token['username'] = self.username
        token['email'] = self.email
        token['role_id'] = self.role.id
        token['role_name'] = self.role.name
        return token