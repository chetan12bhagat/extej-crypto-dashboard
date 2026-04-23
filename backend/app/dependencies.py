import httpx
from functools import lru_cache
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends
from jose import jwt, JWTError
from app.config import settings

security = HTTPBearer()

@lru_cache(maxsize=1)
def _get_jwks() -> dict:
    """Fetch JWKS from Cognito (cached)."""
    response = httpx.get(settings.jwks_url, timeout=10)
    response.raise_for_status()
    return response.json()


def verify_cognito_token(token: str) -> dict:
    """Verify a Cognito JWT and return the decoded claims."""
    try:
        jwks = _get_jwks()
        header = jwt.get_unverified_header(token)
        key = next(
            (k for k in jwks["keys"] if k["kid"] == header["kid"]),
            None,
        )
        if not key:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token key")

        # Decode without audience check first, then verify manually
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            options={"verify_aud": False, "verify_at_hash": False},
        )
        
        # Verify client_id (for Access Tokens) or aud (for ID Tokens)
        client_id = payload.get("client_id") or payload.get("aud")
        if client_id != settings.cognito_client_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token audience/client_id mismatch",
            )
            
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {exc}",
        ) from exc


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Dependency that extracts and verifies the Bearer token."""
    return verify_cognito_token(credentials.credentials)
