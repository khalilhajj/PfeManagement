from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import secrets
import string

def generate_activation_token():
    """Generate a simple secure random token"""
    return secrets.token_urlsafe(32)

def generate_secure_password(length=12):
    """Generate a secure random password"""
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special = "!@#$%^&*"
    
    password = [
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(digits),
        secrets.choice(special),
    ]
    
    all_chars = lowercase + uppercase + digits + special
    password.extend(secrets.choice(all_chars) for _ in range(length - 4))
    
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)

def send_activation_email(user, password):
    """Send account activation email with credentials"""
    activation_url = f"{settings.FRONTEND_URL}/activate/{user.activation_token}"
    
    subject = 'Activate Your PFE Management Account'
    
    message = f"""
Hello {user.first_name} {user.last_name},

An administrator has created an account for you on the PFE Management platform.

Your Login Credentials:
Username: {user.username}
Email: {user.email}
Password: {password}

To activate your account, please click the link below:
{activation_url}

Important:
- You must activate your account before you can log in
- Please change your password after your first login
- Keep your credentials secure

If you did not request this account, please contact support@pfemanagement.com

Best regards,
PFE Management Team
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False