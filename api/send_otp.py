import json
import os
import smtplib
import hmac
import hashlib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import BaseHTTPRequestHandler

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SECRET_KEY = os.environ.get("OTP_SECRET", "validex-otp-secret-key-2024")
OTP_WINDOW = 600  # 10 minutes in seconds


def generate_otp(email: str, timestamp: int = None) -> str:
    """Generate a deterministic 6-digit OTP using HMAC."""
    if timestamp is None:
        # Round to 10-minute windows
        timestamp = int(time.time()) // OTP_WINDOW
    
    key = SECRET_KEY.encode()
    msg = f"{email}:{timestamp}".encode()
    digest = hmac.new(key, msg, hashlib.sha256).hexdigest()
    # Take first 6 digits from the hex digest
    otp = str(int(digest[:8], 16) % 1000000).zfill(6)
    return otp


def send_email(to_email: str, otp_code: str) -> bool:
    """Send the OTP email via Gmail SMTP."""
    if not SMTP_USER or not SMTP_PASSWORD:
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"Validex <{SMTP_USER}>"
        msg["To"] = to_email
        msg["Subject"] = "Your Validex Verification Code"

        html_body = f"""
        <html>
        <body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
            <tr><td align="center">
              <table width="500" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <span style="font-size:28px;font-weight:800;color:#000;letter-spacing:-1px;">⚡ Validex</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h2 style="font-size:22px;font-weight:700;color:#000;margin:0 0 8px 0;">Your verification code</h2>
                    <p style="color:#666;font-size:15px;margin:0 0 28px 0;">Use the code below to sign in to your Validex account. It expires in <strong>10 minutes</strong>.</p>
                    <div style="background:#f4f4f5;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
                      <span style="font-size:42px;font-weight:800;letter-spacing:10px;color:#000;font-family:monospace;">{otp_code}</span>
                    </div>
                    <p style="color:#999;font-size:13px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """

        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)
            email = data.get("email", "").strip().lower()

            if not email or "@" not in email:
                self._respond(400, {"detail": "Invalid email address"})
                return

            otp = generate_otp(email)
            sent = send_email(email, otp)

            if sent:
                self._respond(200, {"message": f"Verification code sent to {email}"})
            else:
                # SMTP not configured — return code in demo mode
                self._respond(200, {"message": "Demo mode", "code": otp})

        except Exception as e:
            self._respond(500, {"detail": str(e)})

    def do_OPTIONS(self):
        self._set_cors_headers()
        self.send_response(200)
        self.end_headers()

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _respond(self, status: int, body: dict):
        self.send_response(status)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

    def log_message(self, format, *args):
        pass
