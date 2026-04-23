from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserProfile(BaseModel):
    userId: str
    email: str
    name: str
    picture: Optional[str] = None
    provider: str = "email"
    role: str = "user"
    createdAt: str
    lastLoginAt: str
    securityScore: int = 85
    mfaEnabled: bool = False
    portfolioValue: float = 0.0
    currency: str = "USD"
    theme: str = "dark"


class SyncUserRequest(BaseModel):
    sub: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    identities: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    currency: Optional[str] = None
    theme: Optional[str] = None


class UserSettings(BaseModel):
    userId: str
    notifications: dict = {
        "email": True, "push": True, "sms": False,
        "priceAlerts": True, "txAlerts": True,
    }
    language: str = "en"
    currency: str = "USD"
    theme: str = "dark"
    twoFactorEnabled: bool = False
