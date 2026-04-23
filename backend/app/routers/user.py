from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from app.dependencies import get_current_user
from app.models.user import UserProfile, UpdateProfileRequest, UserSettings
from app.services import dynamo_service as db

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    item = db.get_item(f"USER#{user_id}", "PROFILE")
    if not item:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserProfile(**{k: v for k, v in item.items() if k not in ("PK", "SK")})


@router.patch("/profile", response_model=UserProfile)
async def update_profile(
    req: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    updates = req.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    updated = db.update_item(f"USER#{user_id}", "PROFILE", updates)
    return UserProfile(**{k: v for k, v in updated.items() if k not in ("PK", "SK")})


@router.get("/settings")
async def get_settings(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    item = db.get_item(f"USER#{user_id}", "SETTINGS")
    if not item:
        default = UserSettings(userId=user_id)
        return default.model_dump()
    return {k: v for k, v in item.items() if k not in ("PK", "SK")}


@router.patch("/settings")
async def update_settings(
    settings: dict,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    settings["userId"] = user_id
    item = {"PK": f"USER#{user_id}", "SK": "SETTINGS", **settings}
    db.put_item(item)
    return {k: v for k, v in item.items() if k not in ("PK", "SK")}


@router.delete("/account", status_code=204)
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Delete user profile record. Cognito deletion requires admin SDK."""
    user_id = current_user["sub"]
    # Delete all user records
    items = db.query_items(f"USER#{user_id}")
    for item in items:
        db.delete_item(item["PK"], item["SK"])
    return None
