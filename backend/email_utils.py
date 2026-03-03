"""
Email utility for sending password reset emails via SMTP
"""
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

# Email configuration from environment
SMTP_HOST = os.environ.get('SMTP_HOST', 'mail.fiberathome.net')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL', SMTP_USER)
SMTP_FROM_NAME = os.environ.get('SMTP_FROM_NAME', 'FGL Salesforce Management')


def send_password_reset_email(to_email: str, reset_token: str, reset_url: str) -> bool:
    """
    Send password reset email to user
    
    Args:
        to_email: Recipient email address
        reset_token: The password reset token
        reset_url: Base URL for the reset page (e.g., http://103.131.159.248)
    
    Returns:
        True if email sent successfully, False otherwise
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Email not sent.")
        return False
    
    # Create reset link
    reset_link = f"{reset_url}/reset-password?token={reset_token}"
    
    # Create message
    message = MIMEMultipart("alternative")
    message["Subject"] = "Password Reset - FGL Salesforce Management"
    message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    message["To"] = to_email
    
    # Plain text version
    text = f"""
Hello,

You requested a password reset for your FGL Salesforce Management account.

Click the link below to reset your password:
{reset_link}

This link will expire in 15 minutes.

If you didn't request this, please ignore this email.

Best regards,
FGL Salesforce Management Team
    """
    
    # HTML version
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
        .button:hover {{ background: #2563eb; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 15px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">FGL Salesforce Management</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
        </div>
        <div class="content">
            <h2>Hello,</h2>
            <p>You requested a password reset for your FGL Salesforce Management account.</p>
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="{reset_link}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
                <strong>Note:</strong> This link will expire in 15 minutes.
            </div>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>Best regards,<br><strong>FGL Salesforce Management Team</strong></p>
        </div>
        <div class="footer">
            <p>&copy; 2026 Fiber @ Home Global Limited. All rights reserved.</p>
            <p>Developed by Zobair Khan</p>
        </div>
    </div>
</body>
</html>
    """
    
    # Attach parts
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    message.attach(part1)
    message.attach(part2)
    
    try:
        # Try TLS first (port 587)
        context = ssl.create_default_context()
        
        if SMTP_PORT == 465:
            # SSL connection
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM_EMAIL, to_email, message.as_string())
        else:
            # TLS connection (port 587 or 25)
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.ehlo()
                if SMTP_PORT != 25:
                    server.starttls(context=context)
                    server.ehlo()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM_EMAIL, to_email, message.as_string())
        
        logger.info(f"Password reset email sent to {to_email}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP authentication failed: {e}")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error sending email: {e}")
        return False
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False
