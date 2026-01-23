
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PfeManagement.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

try:
    if not User.objects.filter(username='company').exists():
        print("Creating 'company' user...")
        # Create user with a dummy password, they won't log in directly or can reset it
        User.objects.create_user(username='company', password='CompanyPassword123!', email='company@example.com')
        print("✅ 'company' user created successfully.")
    else:
        print("ℹ️ 'company' user already exists.")
except Exception as e:
    print(f"❌ Error creating user: {e}")
