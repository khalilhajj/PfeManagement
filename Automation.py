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
full_path = "/home/khalil/Downloads/Cahier_des_Charges_Projet.pdf"
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


#StudentLogin to fill internship
time.sleep(2)
username_field = driver.find_element(By.ID, "username")
username_field.send_keys("student")

password_field = driver.find_element(By.ID, "password")
password_field.send_keys("STUDENT123student")

login_button = driver.find_element(By.CSS_SELECTOR, "button.login-button")
login_button.click()

time.sleep(3)

#Navigate to student profile
driver.get("http://localhost:3000/profile")
time.sleep(1)
driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
time.sleep(1)
add_internship_button = driver.find_element(By.ID, "add-internship-button")
add_internship_button.click()
time.sleep(1)
title_field = driver.find_element(By.ID, "title")
title_field.send_keys("My Internship")
time.sleep(1)
type_select = Select(wait.until(
EC.presence_of_element_located((By.ID, "type"))
))
type_select.select_by_visible_text("Stage")
company_field = driver.find_element(By.ID, "company_name")
company_field.send_keys("Teleperformance")
start_date_field = driver.find_element(By.ID, "start_date")
start_date_field.send_keys("2025-06-01")
end_date_field = driver.find_element(By.ID, "end_date")
end_date_field.send_keys("2025-08-31")
description_field = driver.find_element(By.ID, "description")
description_field.send_keys("This is a description of my internship.")
cahier_de_charges_field = driver.find_element(By.ID, "cahier_de_charges")
cahier_de_charges_field.send_keys(full_path)
submit_internship_button = driver.find_element(By.ID, "submit-internship-button")
submit_internship_button.click()
time.sleep(200)
print("Login automation completed!")
