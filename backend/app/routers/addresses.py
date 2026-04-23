from fastapi import APIRouter, Depends
from datetime import datetime, timezone
import uuid
from app.dependencies import get_current_user
from app.models.transaction import SavedAddressCreate
from app.services import dynamo_service as db
from app.services.crypto_validator import validate_address

router = APIRouter(prefix="/addresses", tags=["addresses"])


@router.get("")
async def list_addresses(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    items = db.query_items(f"USER#{user_id}", "ADDRESS#")
    return [{k: v for k, v in i.items() if k not in ("PK", "SK")} for i in items]


@router.post("")
async def add_address(
    req: SavedAddressCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    addr_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    validation = validate_address(req.address, req.coin)
    item = {
        "PK": f"USER#{user_id}",
        "SK": f"ADDRESS#{addr_id}",
        "addressId": addr_id,
        "label": req.label,
        "address": req.address,
        "coin": req.coin,
        "note": req.note,
        "isValid": validation["isValid"],
        "riskScore": validation["riskScore"],
        "validatedAt": now,
    }
    db.put_item(item)
    return {k: v for k, v in item.items() if k not in ("PK", "SK")}


@router.patch("/{address_id}")
async def update_address(
    address_id: str,
    updates: dict,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    updated = db.update_item(f"USER#{user_id}", f"ADDRESS#{address_id}", updates)
    return {k: v for k, v in updated.items() if k not in ("PK", "SK")}


@router.delete("/{address_id}", status_code=204)
async def remove_address(address_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    db.delete_item(f"USER#{user_id}", f"ADDRESS#{address_id}")
    return None
