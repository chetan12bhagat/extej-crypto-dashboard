from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
import uuid
from app.dependencies import get_current_user
from app.models.user import SyncUserRequest, UserProfile
from app.services import dynamo_service as db

import random
from pydantic import BaseModel
from app.services.mail_service import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])

class SendOTPRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    code: str

@router.post("/send-otp")
async def send_otp(req: SendOTPRequest):
    """Generate and send an OTP to the user's email."""
    code = f"{random.randint(100000, 999999)}"
    expiry = int(datetime.now(timezone.utc).timestamp()) + 600 # 10 mins
    
    # Store in DynamoDB
    pk = f"OTP#{req.email}"
    sk = "CODE"
    db.put_item({
        "PK": pk,
        "SK": sk,
        "code": code,
        "expiresAt": expiry
    })
    
    success = send_otp_email(req.email, code)
    if not success:
        # For demo purposes, we return the code if mail fails to configure
        return {"message": "OTP generated (Simulation Mode)", "code": code}
        
    return {"message": "OTP sent successfully"}

@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    """Verify the OTP code provided by the user."""
    pk = f"OTP#{req.email}"
    sk = "CODE"
    item = db.get_item(pk, sk)
    
    if not item:
        raise HTTPException(status_code=400, detail="No OTP found for this email")
        
    now = int(datetime.now(timezone.utc).timestamp())
    if now > item["expiresAt"]:
        db.delete_item(pk, sk)
        raise HTTPException(status_code=400, detail="OTP expired")
        
    if item["code"] != req.code:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    
    # Success - cleanup
    db.delete_item(pk, sk)
    
    # In a real app, you'd issue a JWT here. 
    # For this project, the frontend will use this success to trigger mock login.
    return {"message": "Verification successful", "email": req.email}

@router.post("/sync-user", response_model=UserProfile)
async def sync_user(
    req: SyncUserRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create or update DynamoDB user record on first login."""
    user_id = current_user["sub"]
    pk = f"USER#{user_id}"
    sk = "PROFILE"

    existing = db.get_item(pk, sk)
    now = datetime.now(timezone.utc).isoformat()

    if existing:
        # Update last login
        db.update_item(pk, sk, {"lastLoginAt": now})
        existing["lastLoginAt"] = now
        return UserProfile(**existing)

    # Create new user record
    profile = {
        "PK": pk,
        "SK": sk,
        "userId": user_id,
        "email": req.email,
        "name": req.name or req.email,
        "picture": req.picture,
        "provider": "google" if req.identities else "email",
        "role": "user",
        "createdAt": now,
        "lastLoginAt": now,
        "securityScore": 85,
        "mfaEnabled": False,
        "portfolioValue": 0.0,
        "currency": "USD",
        "theme": "dark",
    }
    db.put_item(profile)
    return UserProfile(**{k: v for k, v in profile.items() if k not in ("PK", "SK")})


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's DynamoDB profile."""
    user_id = current_user["sub"]
    item = db.get_item(f"USER#{user_id}", "PROFILE")
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserProfile(**{k: v for k, v in item.items() if k not in ("PK", "SK")})


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Revoke session (Cognito handles token blacklisting)."""
    return {"message": "Logged out successfully"}
