import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def send_otp_email(to_email: str, otp_code: str):
    """Send an OTP verification email using SMTP."""
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP credentials not configured. Email NOT sent.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.smtp_from
        msg['To'] = to_email
        msg['Subject'] = "Your Validex Verification Code"

        body = f"""
        <html>
        <body style="font-family: sans-serif; color: #111;">
            <div style="max-width: 500px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
                <h2 style="font-size: 24px; font-weight: 800; color: #000;">Verification Code</h2>
                <p style="font-size: 16px; color: #666;">Use the code below to sign in to your Validex account.</p>
                <div style="background: #f4f4f5; padding: 20px; border-radius: 12px; font-size: 32px; font-weight: 800; text-align: center; letter-spacing: 5px; margin: 30px 0;">
                    {otp_code}
                </div>
                <p style="font-size: 14px; color: #999;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        
        logger.info(f"OTP sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False
