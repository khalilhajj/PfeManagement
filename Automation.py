from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support import expected_conditions as EC

import os

file_path = "cahier_de_charges.pdf"
full_path = "C:/Users/fatma/OneDrive/Documents/cahier_de_charges.pdf"
# Chrome options
options = Options()
options.add_argument("--start-maximized")

# Start Chrome
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)
wait = WebDriverWait(driver, 10) 
# add user process
driver.get("http://localhost:3000")

time.sleep(1)

# username_field = driver.find_element(By.ID, "username")
# username_field.send_keys("admin")

# password_field = driver.find_element(By.ID, "password")
# password_field.send_keys("admin")

# login_button = driver.find_element(By.CSS_SELECTOR, "button.login-button")
# login_button.click()

# time.sleep(3)

#navigate to user management and add student
# driver.get("http://localhost:3000/user-management")
# time.sleep(1)
# username_field = driver.find_element(By.ID, "add-user-button")
# username_field.click()
# username_field = driver.find_element(By.ID, "username")
# username_field.send_keys("student")
# email_field = driver.find_element(By.ID, "email")
# email_field.send_keys("student@student.com")
# first_name_field = driver.find_element(By.ID, "first_name")
# first_name_field.send_keys("Student")
# last_name_field = driver.find_element(By.ID, "last_name")
# last_name_field.send_keys("Student")
# password_field = driver.find_element(By.ID, "password")
# password_field.send_keys("STUDENT123student")
# confirm_password_field = driver.find_element(By.ID, "password_confirm")
# confirm_password_field.send_keys("STUDENT123student")
# phone_field = driver.find_element(By.ID, "phone")
# phone_field.send_keys("12345678")
# time.sleep(1)
# role_select = Select(wait.until(
#     EC.presence_of_element_located((By.ID, "role"))
# ))

# role_select.select_by_visible_text("Student")

# submit_button = driver.find_element(By.ID, "confirm-user-button")
# submit_button.click()

# #Add teacher
# username_field = driver.find_element(By.ID, "add-user-button")
# username_field.click()
# username_field = driver.find_element(By.ID, "username")
# username_field.send_keys("teacher")
# email_field = driver.find_element(By.ID, "email")
# email_field.send_keys("teacher@teacher.com")
# first_name_field = driver.find_element(By.ID, "first_name")
# first_name_field.send_keys("Teacher")
# last_name_field = driver.find_element(By.ID, "last_name")
# last_name_field.send_keys("Teacher")
# password_field = driver.find_element(By.ID, "password")
# password_field.send_keys("TEACHER123teacher")
# confirm_password_field = driver.find_element(By.ID, "password_confirm")
# confirm_password_field.send_keys("TEACHER123teacher")
# phone_field = driver.find_element(By.ID, "phone")
# phone_field.send_keys("12345678")
# time.sleep(1)
# role_select = Select(wait.until(
#     EC.presence_of_element_located((By.ID, "role"))
# ))

# role_select.select_by_visible_text("Teacher")

# submit_button = driver.find_element(By.ID, "confirm-user-button")
# submit_button.click()

# #Logout admin
# time.sleep(2)
# dropdown_button = driver.find_element(By.ID, "user-dropdown")
# dropdown_button.click()
# logout_button = driver.find_element(By.ID, "logout-button")
# logout_button.click()

# ========================================

#StudentLogin to fill internship
time.sleep(2)
username_field = wait.until(EC.presence_of_element_located((By.ID, "username")))
username_field.send_keys("student")

password_field = driver.find_element(By.ID, "password")
password_field.send_keys("STUDENT123student")

login_button = driver.find_element(By.CSS_SELECTOR, "button.login-button")
login_button.click()

time.sleep(3)

#Navigate to student profile
driver.get("http://localhost:3000/profile")
time.sleep(1)
for _ in range(2):
    driver.execute_script("window.scrollBy(0, 300);")  # x=0, y=300
    time.sleep(0.5)  # small pause so page has time to render

add_internship_button = driver.find_element(By.ID, "add-internship-button")
add_internship_button.click()
time.sleep(1)

title_field = driver.find_element(By.ID, "title")
title_field.send_keys("PFE Internship TEST")
time.sleep(1)

type_select = Select(wait.until(EC.presence_of_element_located((By.ID, "type"))))
type_select.select_by_visible_text("Internship")

company_field = driver.find_element(By.ID, "company_name")
company_field.send_keys("TEST")

start_date_field = driver.find_element(By.ID, "start_date")
start_date_field.click()
start_date_field.send_keys("06/05/2026")  # format MM/DD/YYYY selon le navigateur

end_date_field = driver.find_element(By.ID, "end_date")
end_date_field.click()
end_date_field.send_keys("08/11/2026")


description_field = driver.find_element(By.ID, "description")
description_field.send_keys("This is a description of my internship.")

cahier_de_charges_field = driver.find_element(By.ID, "cahier_de_charges")
cahier_de_charges_field.send_keys(full_path)

submit_internship_button = driver.find_element(By.ID, "submit-internship-button")
submit_internship_button.click()
time.sleep(2)
print("Login automation completed!")

try:
    modal_close_button = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, ".modal-close"))
    )
    modal_close_button.click()
    time.sleep(0.5)
except:
    print("Aucun modal ouvert à fermer.")


driver.execute_script("window.scrollTo(0, 0);")
time.sleep(0.5)
dropdown_button = driver.find_element(By.ID, "user-dropdown")
dropdown_button.click()

logout_button = driver.find_element(By.ID, "logout-button")
logout_button.click()

# Admin login and approve internship
username_field = driver.find_element(By.ID, "username")
username_field.send_keys("admin")

password_field = driver.find_element(By.ID, "password")
password_field.send_keys("admin")

login_button = driver.find_element(By.CSS_SELECTOR, "button.login-button")
login_button.click()
time.sleep(3)

driver.get("http://localhost:3000/pending-internships")
time.sleep(2)

wait = WebDriverWait(driver, 10)

approve_row_button = wait.until(EC.element_to_be_clickable((By.ID, "admin-approve-button")))
approve_row_button.click()

wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "modal-overlay")))

confirm_button = wait.until(EC.element_to_be_clickable((By.ID, "approve-internship-button")))
confirm_button.click()

time.sleep(2)



# Logout admin
dropdown_button = driver.find_element(By.ID, "user-dropdown")
dropdown_button.click()
time.sleep(1)

logout_button = driver.find_element(By.ID, "logout-button")
logout_button.click()
time.sleep(2)


# Student login to add teacher as supervisor
username_field = driver.find_element(By.ID, "username")
username_field.send_keys("student")

password_field = driver.find_element(By.ID, "password")
password_field.send_keys("STUDENT123student")

login_button = driver.find_element(By.CSS_SELECTOR, "button.login-button")
login_button.click()
time.sleep(3)

driver.get("http://localhost:3000/profile")
time.sleep(2)


# la liste des internships

for _ in range(2):
    driver.execute_script("window.scrollBy(0, 300);")  # x=0, y=300
    time.sleep(0.5)  # small pause so page has time to render

first_card = wait.until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, ".internship-card"))
)

driver.execute_script("window.scrollBy(0, 500);")
time.sleep(0.5)


# Click the header to expand it
header = first_card.find_element(By.CLASS_NAME, "card-header")
driver.execute_script("arguments[0].scrollIntoView(true);", header)
header.click()
time.sleep(1)

# Scroll inside card and click "Invite Teacher"
invite_btn = wait.until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, "button[id^='invite-teacher-']"))
)

driver.execute_script("arguments[0].scrollIntoView(true);", invite_btn)
invite_btn.click()
time.sleep(1)


modal = wait.until(
    EC.visibility_of_element_located((By.CLASS_NAME, "modal-overlay"))
)


# Select the first teacher in the list
first_teacher_radio = wait.until(
    EC.element_to_be_clickable(
        (By.CSS_SELECTOR, ".teacher-item input[type='radio']")
    )
)

driver.execute_script("arguments[0].scrollIntoView(true);", first_teacher_radio)
first_teacher_radio.click()
time.sleep(0.5)

# ==================================

# Add an optional message
message_box = driver.find_element(By.ID, "message")
message_box.clear()
message_box.send_keys("Hello Teacher, you are invited for this internship!")

# Click on "Send Invitation" button (check the ID)
send_invite_button = wait.until(
    EC.element_to_be_clickable((By.ID, "send-invite-button"))
)

driver.execute_script("arguments[0].scrollIntoView(true);", send_invite_button)
time.sleep(0.5)
send_invite_button.click()

print("Invitation envoyée")



try:
    modal_close_button = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, ".modal-close"))
    )
    modal_close_button.click()
    time.sleep(0.5)
except:
    print("Aucun modal ouvert à fermer.")


driver.execute_script("window.scrollTo(0, 0);")
time.sleep(0.5)
dropdown_button = driver.find_element(By.ID, "user-dropdown")
dropdown_button.click()

logout_button = driver.find_element(By.ID, "logout-button")
logout_button.click()


# Teacher login to approve supervision
username_field = driver.find_element(By.ID, "username")
username_field.send_keys("teacher")

password_field = driver.find_element(By.ID, "password")
password_field.send_keys("TEACHER123teacher")

login_button = driver.find_element(By.CSS_SELECTOR, "button.login-button")
login_button.click()
time.sleep(2)

driver.get("http://localhost:3000/pending-invitations")
time.sleep(1)

# wait for first card
first_card = wait.until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, ".invitation-card"))
)

# scroll into view + click
driver.execute_script("arguments[0].scrollIntoView(true);", first_card)
first_card.click()
time.sleep(0.5)

driver.execute_script("window.scrollBy(0, 300);") 
time.sleep(0.5) 
accept_internship_button = driver.find_element(By.ID, "accept-invite")
accept_internship_button.click()
time.sleep(0.5) 
wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "modal-overlay")))
confirm_accept_intern = driver.find_element(By.ID, "confirm-invitation")
confirm_accept_intern.click()
time.sleep(1) 

print("internship confirmed successfully!")


# ===============================
time.sleep(0.5) 
try:
    modal_close_button = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, ".modal-close"))
    )
    modal_close_button.click()
    time.sleep(0.5)
except:
    print("Aucun modal ouvert à fermer.")


driver.execute_script("window.scrollTo(0, 0);")
time.sleep(0.5)
dropdown_button = driver.find_element(By.ID, "user-dropdown")
dropdown_button.click()

logout_button = driver.find_element(By.ID, "logout-button")
logout_button.click()

# Student login to add teacher as supervisor
username_field = driver.find_element(By.ID, "username")
username_field.send_keys("student")

password_field = driver.find_element(By.ID, "password")
password_field.send_keys("STUDENT123student")

login_button = driver.find_element(By.CSS_SELECTOR, "button.login-button")
login_button.click()
time.sleep(2)

driver.get("http://localhost:3000/profile")
time.sleep(1)


# la liste des internships

for _ in range(2):
    driver.execute_script("window.scrollBy(0, 300);")  # x=0, y=300
    time.sleep(0.5)  # small pause so page has time to render

first_card = wait.until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, ".internship-card"))
)

driver.execute_script("window.scrollBy(0, 500);")
time.sleep(0.5)

# Click the header to expand it
header = first_card.find_element(By.CLASS_NAME, "card-header")
driver.execute_script("arguments[0].scrollIntoView(true);", header)
header.click()
time.sleep(5)

print("supervisor added successfully!")