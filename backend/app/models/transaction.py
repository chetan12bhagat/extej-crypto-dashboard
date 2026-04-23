from pydantic import BaseModel
from typing import Optional
from enum import Enum


class TxStatus(str, Enum):
    pending = "pending"
    validated = "validated"
    failed = "failed"


class TransactionCreate(BaseModel):
    hash: str
    from_address: str
    to_address: str
    amount: float
    coin: str
    fee: float = 0.0
    note: Optional[str] = None


class Transaction(TransactionCreate):
    txId: str
    status: TxStatus = TxStatus.pending
    timestamp: str
    validatedAt: Optional[str] = None
    blockNumber: Optional[int] = None


class UpdateStatusRequest(BaseModel):
    status: TxStatus


class ValidateAddressRequest(BaseModel):
    address: str
    coin: str


class BulkValidateRequest(BaseModel):
    addresses: list[ValidateAddressRequest]


class ValidateTransactionRequest(BaseModel):
    hash: str
    network: str


class SavedAddressCreate(BaseModel):
    label: str
    address: str
    coin: str
    note: Optional[str] = None
