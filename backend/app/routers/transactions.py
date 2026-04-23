from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
import uuid, csv, io
from app.dependencies import get_current_user
from app.models.transaction import TransactionCreate, Transaction, UpdateStatusRequest, TxStatus
from app.services import dynamo_service as db

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("")
async def list_transactions(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    coin: str | None = None,
):
    user_id = current_user["sub"]
    items = db.query_items(f"USER#{user_id}", "TX#")
    # Filter
    if status:
        items = [i for i in items if i.get("status") == status]
    if coin:
        items = [i for i in items if i.get("coin", "").upper() == coin.upper()]
    total = len(items)
    start = (page - 1) * limit
    page_items = items[start : start + limit]
    return {"items": page_items, "total": total, "page": page}


@router.get("/export")
async def export_transactions(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    items = db.query_items(f"USER#{user_id}", "TX#")
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["txId", "hash", "from_address", "to_address", "amount", "coin", "fee", "status", "timestamp"])
    writer.writeheader()
    for item in items:
        writer.writerow({k: item.get(k, "") for k in writer.fieldnames})
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"},
    )


@router.get("/{tx_id}")
async def get_transaction(tx_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    items = db.query_items(f"USER#{user_id}", f"TX#")
    tx = next((i for i in items if i.get("txId") == tx_id), None)
    if not tx:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.post("", response_model=Transaction)
async def create_transaction(
    req: TransactionCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    tx_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    item = {
        "PK": f"USER#{user_id}",
        "SK": f"TX#{now}#{tx_id}",
        "txId": tx_id,
        "status": TxStatus.pending.value,
        "timestamp": now,
        **req.model_dump(),
    }
    db.put_item(item)
    return Transaction(**{k: v for k, v in item.items() if k not in ("PK", "SK")})


@router.patch("/{tx_id}/status")
async def update_status(
    tx_id: str,
    req: UpdateStatusRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    items = db.query_items(f"USER#{user_id}", "TX#")
    tx = next((i for i in items if i.get("txId") == tx_id), None)
    if not tx:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Transaction not found")
    now = datetime.now(timezone.utc).isoformat()
    updates = {"status": req.status.value}
    if req.status == TxStatus.validated:
        updates["validatedAt"] = now
    db.update_item(tx["PK"], tx["SK"], updates)
    return {"txId": tx_id, "status": req.status.value}
