from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, user, wallet, transactions, validation, addresses

app = FastAPI(
    title="Extej API",
    version="1.0.0",
    description="Extej — Crypto Wallet & Transaction Validation Dashboard API",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(wallet.router)
app.include_router(transactions.router)
app.include_router(validation.router)
app.include_router(addresses.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "extej-api", "version": "1.0.0"}
