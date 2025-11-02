import os
import sys

print("Python executable:", sys.executable)
print("Python version:", sys.version)
print("Current directory:", os.getcwd())
print("\nDjango settings:", os.environ.get('DJANGO_SETTINGS_MODULE'))

# Check if authentication app exists
print("\nAuthentication module location:")
try:
    import authentication
    print(authentication.__file__)
except ImportError as e:
    print(f"Error importing authentication: {e}")

# Check if tests exist
print("\nTests location:")
try:
    from authentication.tests import test_models
    print(test_models.__file__)
except ImportError as e:
    print(f"Error importing tests: {e}")

# Check coverage installation
print("\nCoverage version:")
try:
    import coverage
    print(coverage.__version__)
except ImportError:
    print("Coverage not installed!")