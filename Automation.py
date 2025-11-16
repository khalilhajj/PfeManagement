from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
import time

# Chrome options
options = Options()
options.add_argument("--start-maximized")

# Start Chrome
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

# 1. Open your login page (React)
driver.get("http://localhost:3000")

time.sleep(1)  # Wait for React to load

# 2. Find the username field and enter text
username_field = driver.find_element(By.ID, "username")
username_field.send_keys("khalilhajri")

# 3. Find the password field and enter text
password_field = driver.find_element(By.ID, "password")
password_field.send_keys("khalilhajri")

# 4. Click the login button
login_button = driver.find_element(By.CSS_SELECTOR, "button.login-button")
login_button.click()

# Wait for navigation
time.sleep(3)

print("Login automation completed!")
