import resend
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Resend
if settings.resend_api_key:
    resend.api_key = settings.resend_api_key

def send_otp_email(to_email: str, otp_code: str):
    """Send an OTP verification email using Resend API."""
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not configured. Email NOT sent.")
        return False

    try:
        html_content = f"""
        <html>
        <body style="font-family: 'Inter', -apple-system, sans-serif; color: #111; background-color: #f9f9fb; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.04);">
                <div style="margin-bottom: 32px; text-align: center;">
                    <div style="width: 48px; height: 48px; background: #000; border-radius: 12px; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; font-weight: 900;">V</div>
                </div>
                <h2 style="font-size: 24px; font-weight: 800; color: #000; margin-bottom: 12px; text-align: center;">Verification Code</h2>
                <p style="font-size: 15px; color: #666; line-height: 1.6; text-align: center; margin-bottom: 32px;">
                    Use the secure code below to sign in to your Validex account. This code is unique to you and should not be shared.
                </p>
                <div style="background: #f4f4f5; padding: 24px; border-radius: 16px; font-size: 36px; font-weight: 800; text-align: center; letter-spacing: 8px; color: #000; margin-bottom: 32px; border: 1px solid #e4e4e7;">
                    {otp_code}
                </div>
                <div style="border-top: 1px solid #f1f1f4; padding-top: 24px;">
                    <p style="font-size: 13px; color: #999; line-height: 1.6; margin-bottom: 8px;">
                        • This code will expire in <strong>5 minutes</strong>.
                    </p>
                    <p style="font-size: 13px; color: #999; line-height: 1.6;">
                        • If you didn't request this code, please ignore this email or contact security if you're concerned.
                    </p>
                </div>
            </div>
            <p style="text-align: center; font-size: 12px; color: #bbb; margin-top: 32px;">
                © 2025 Validex Crypto Platform. All rights reserved.
            </p>
        </body>
        </html>
        """

        params = {
            "from": settings.smtp_from,
            "to": to_email,
            "subject": f"{otp_code} is your Validex verification code",
            "html": html_content,
        }

        resend.Emails.send(params)
        logger.info(f"OTP sent successfully via Resend to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email via Resend: {str(e)}")
        return False
