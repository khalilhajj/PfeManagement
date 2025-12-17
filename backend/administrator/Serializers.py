from administrator.utils import generate_secure_password, generate_activation_token, send_activation_email
from rest_framework import serializers
from authentication.models import User, Role
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
from django.utils import timezone

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']

class UserListSerializer(serializers.ModelSerializer):
    """Serializer for listing users"""
    role_name = serializers.CharField(source='role.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'profile_picture', 'role', 'role_name','is_enabled'
            , 'is_active', 'date_joined'
        ]
        read_only_fields = ['date_joined']

class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed user view"""
    role_name = serializers.CharField(source='role.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'profile_picture', 'role', 'role_name','is_enabled', 'is_active', 'is_staff', 'date_joined', 'last_login'
        ]
        read_only_fields = ['date_joined', 'last_login']

class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users"""
    email = serializers.EmailField(
        required=True,
        validators=[EmailValidator(message="Enter a valid email address.")]
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 
            'phone', 'profile_picture', 'role'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_username(self, value):
        """Validate username uniqueness and format"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters.")
        
        if not value.replace('_', '').isalnum():
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, and underscores."
            )
        
        return value.lower()
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        
        return value.lower()
    
    def validate_phone(self, value):
        """Validate phone number"""
        if value:
            cleaned = value.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
            if not cleaned.replace('+', '').isdigit():
                raise serializers.ValidationError("Phone number must contain only digits.")
            if len(cleaned) < 8:
                raise serializers.ValidationError("Phone number must be at least 8 digits.")
        return value
    
    
    def create(self, validated_data):
        """Create user with auto-generated password and send activation email"""
        password = generate_secure_password()
        
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data.get('role'),
            phone=validated_data.get('phone', ''),
            is_enabled=False,
            is_active=True,
        )
        if 'profile_picture' in validated_data:
            user.profile_picture = validated_data['profile_picture']
        user.set_password(password)
        
        user.activation_token = generate_activation_token()
        user.activation_token_created = timezone.now()
        user.save()
        email_sent = send_activation_email(user, password)
        
        if not email_sent:
            print(f"Warning: Failed to send activation email to {user.email}")
        user._generated_password = password
        
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating existing users"""
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'phone',
            'profile_picture', 'role', 'is_active'
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness (excluding current user)"""
        user = self.instance
        if User.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Email already exists.")
        
        return value.lower()

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password reset by admin"""
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate_new_password(self, value):
        """Validate password strength"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password_confirm": "Passwords do not match."
            })
        
        return attrs
    
    class Meta:
        ref_name = "AdminChangePasswordSerializer"