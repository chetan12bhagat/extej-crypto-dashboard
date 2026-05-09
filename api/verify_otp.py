import json
import os
import hmac
import hashlib
import time
from http.server import BaseHTTPRequestHandler

SECRET_KEY = os.environ.get("OTP_SECRET", "validex-otp-secret-key-2024")
OTP_WINDOW = 600  # 10 minutes


def generate_otp(email: str, timestamp: int = None) -> str:
    """Generate the same deterministic OTP as send_otp.py."""
    if timestamp is None:
        timestamp = int(time.time()) // OTP_WINDOW
    key = SECRET_KEY.encode()
    msg = f"{email}:{timestamp}".encode()
    digest = hmac.new(key, msg, hashlib.sha256).hexdigest()
    return str(int(digest[:8], 16) % 1000000).zfill(6)


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)

            email = data.get("email", "").strip().lower()
            code = data.get("code", "").strip()

            if not email or not code:
                self._respond(400, {"detail": "Email and code are required"})
                return

            # Check current 10-minute window AND the previous one (grace period)
            current_window = int(time.time()) // OTP_WINDOW
            valid_otps = [
                generate_otp(email, current_window),
                generate_otp(email, current_window - 1),
            ]

            if code in valid_otps:
                self._respond(200, {"message": "OTP verified successfully"})
            else:
                self._respond(401, {"detail": "Invalid or expired verification code"})

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
