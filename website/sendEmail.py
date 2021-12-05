import smtplib
import secrets
def sendEmail():
    token = secrets.token_urlsafe()
  
# creates SMTP session 
    email = smtplib.SMTP('smtp.gmail.com', 587) 
  
# TLS for security 
    email.starttls() 
  
# authentication
# compiler gives an error for wrong credential. 
    email.login("udemytuananh@gmail.com", "@tuananh123") 
  
# message to be sent 
    message = f'Your New PassWord is {token}'
  
# sending the mail 
    email.sendmail("udemytuananh@gmail.com", "vuhoangtuananh30041994@gmail.com", message) 
  
# terminating the session 
    email.quit()

    return token

