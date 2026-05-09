import sys
import os

# Add root directory to path so we can import 'backend'
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.app.main import app

# Vercel handles FastAPI apps natively
# We just need to expose the 'app' object
