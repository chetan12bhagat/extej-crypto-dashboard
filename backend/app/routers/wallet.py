from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import uuid
from app.dependencies import get_current_user
from app.models.wallet import WalletCreate, Wallet, WalletSummary
from app.services import dynamo_service as db

router = APIRouter(prefix="/wallet", tags=["wallet"])


@router.get("", response_model=list[Wallet])
async def get_wallets(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    items = db.query_items(f"USER#{user_id}", "WALLET#")
    return [Wallet(**{k: v for k, v in i.items() if k not in ("PK", "SK")}) for i in items]


@router.post("", response_model=Wallet)
async def add_wallet(
    req: WalletCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    wallet_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    item = {
        "PK": f"USER#{user_id}",
        "SK": f"WALLET#{wallet_id}",
        "walletId": wallet_id,
        "createdAt": now,
        **req.model_dump(),
    }
    db.put_item(item)
    return Wallet(**{k: v for k, v in item.items() if k not in ("PK", "SK")})


@router.delete("/{wallet_id}", status_code=204)
async def remove_wallet(wallet_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    db.delete_item(f"USER#{user_id}", f"WALLET#{wallet_id}")
    return None


@router.get("/summary", response_model=WalletSummary)
async def get_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    wallets = db.query_items(f"USER#{user_id}", "WALLET#")
    total = sum(float(w.get("balanceUSD", 0)) for w in wallets)
    return WalletSummary(
        totalValueUSD=total,
        totalValueBTC=total / 76842,
        change24h=total * 0.024,
        changePercent24h=2.4,
        distribution=[
            {"coin": w.get("coin"), "percent": (float(w.get("balanceUSD", 0)) / total * 100) if total else 0, "valueUSD": float(w.get("balanceUSD", 0))}
            for w in wallets
        ],
    )
