from pydantic import BaseModel
from typing import Optional


class WalletCreate(BaseModel):
    label: str
    address: str
    coin: str
    balance: float = 0.0
    balanceUSD: float = 0.0


class Wallet(WalletCreate):
    walletId: str
    createdAt: str
    change24h: Optional[float] = None


class WalletSummary(BaseModel):
    totalValueUSD: float
    totalValueBTC: float
    change24h: float
    changePercent24h: float
    distribution: list[dict]
