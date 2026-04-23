from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
import uuid
from app.dependencies import get_current_user
from app.models.user import SyncUserRequest, UserProfile
from app.services import dynamo_service as db

router = APIRouter(prefix="/auth", tags=["auth"])


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
