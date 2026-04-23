from fastapi import APIRouter, Depends
from datetime import datetime, timezone
import uuid
from app.dependencies import get_current_user
from app.models.transaction import (
    ValidateAddressRequest, BulkValidateRequest, ValidateTransactionRequest,
)
from app.services import dynamo_service as db
from app.services.crypto_validator import validate_address

router = APIRouter(prefix="/validate", tags=["validation"])


@router.post("/address")
async def validate_single_address(
    req: ValidateAddressRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    result = validate_address(req.address, req.coin)
    
    # Store log
    log_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    log_item = {
        "PK": f"USER#{user_id}",
        "SK": f"VALIDATION#{log_id}",
        "logId": log_id,
        "type": "address",
        "input": req.address,
        "result": "valid" if result["isValid"] else "invalid",
        "riskScore": result["riskScore"],
        "coin": req.coin,
        "checkedAt": now,
    }
    db.put_item(log_item)
    
    # Prepare result with message
    is_valid = result["isValid"]
    message = "Address is valid" if is_valid else "Invalid address format"
    if is_valid and result["riskScore"] > 50:
        message = "Address identified as high risk"
    elif is_valid and result["riskScore"] > 20:
        message = "Address identified as suspicious"

    return {**result, "message": message}


@router.post("/address/bulk")
async def validate_bulk_addresses(
    req: BulkValidateRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    results = []
    for addr in req.addresses[:20]:
        res = validate_address(addr.address, addr.coin)
        results.append(res)
        
        # Store log (simplified for bulk)
        log_id = str(uuid.uuid4())
        db.put_item({
            "PK": f"USER#{user_id}",
            "SK": f"VALIDATION#{log_id}",
            "logId": log_id,
            "type": "address",
            "input": addr.address,
            "result": "valid" if res["isValid"] else "invalid",
            "riskScore": res["riskScore"],
            "coin": addr.coin,
            "checkedAt": datetime.now(timezone.utc).isoformat(),
        })
    return results


@router.post("/transaction")
async def validate_transaction(
    req: ValidateTransactionRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    import re
    is_valid = bool(re.match(r"^0x[a-fA-F0-9]{64}$", req.hash))
    res = {
        "hash": req.hash,
        "network": req.network,
        "isValid": is_valid,
        "status": "confirmed" if is_valid else "invalid",
        "riskScore": 5 if is_valid else 90,
        "flags": [] if is_valid else ["invalid_hash_format"],
    }
    
    # Store log
    log_id = str(uuid.uuid4())
    db.put_item({
        "PK": f"USER#{user_id}",
        "SK": f"VALIDATION#{log_id}",
        "logId": log_id,
        "type": "transaction",
        "input": req.hash,
        "result": "valid" if is_valid else "invalid",
        "riskScore": res["riskScore"],
        "checkedAt": datetime.now(timezone.utc).isoformat(),
    })
    
    return res


@router.get("/logs")
async def get_validation_logs(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    items = db.query_items(f"USER#{user_id}", "VALIDATION#")
    return [{k: v for k, v in i.items() if k not in ("PK", "SK")} for i in items]
