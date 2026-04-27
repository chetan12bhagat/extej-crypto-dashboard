import re

def is_valid_eth_address(address: str) -> bool:
    return bool(re.match(r"^0x[a-fA-F0-9]{40}$", address))


def is_valid_btc_address(address: str) -> bool:
    return bool(
        re.match(r"^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$", address)
        or re.match(r"^bc1[a-z0-9]{39,59}$", address)
    )


def is_valid_tx_hash_eth(hash_: str) -> bool:
    return bool(re.match(r"^0x[a-fA-F0-9]{64}$", hash_))


COIN_VALIDATORS = {
    "ETH": is_valid_eth_address,
    "USDT": is_valid_eth_address,  # ERC-20
    "BNB": is_valid_eth_address,
    "MATIC": is_valid_eth_address,
    "AVAX": is_valid_eth_address,
    "BTC": is_valid_btc_address,
    "LTC": lambda a: bool(re.match(r"^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$", a)),
    "XRP": lambda a: bool(re.match(r"^r[0-9a-zA-Z]{24,34}$", a)),
    "SOL": lambda a: bool(re.match(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$", a)),
}


def validate_address(address: str, coin: str) -> dict:
    coin = coin.upper()
    validator = COIN_VALIDATORS.get(coin, lambda _: False)
    is_valid = validator(address)

    # Simple heuristics for risk scoring
    risk_score = 0
    flags = []

    if not is_valid:
        risk_score = 100
        flags.append("invalid_format")
    else:
        if address.lower() in [
            "0xdead000000000000000042069420694206942069",
            "0x0000000000000000000000000000000000000000",
        ]:
            risk_score = 95
            flags.append("burn_address")
        elif len(set(address.lower().replace("0x", ""))) < 4:
            risk_score = 60
            flags.append("low_entropy")

    return {
        "address": address,
        "isValid": is_valid,
        "riskScore": risk_score,
        "flags": flags,
        "network": coin,
        "type": "contract" if coin in ("ETH", "USDT") and is_valid else "wallet",
        "details": {
            "isBurn": "burn_address" in flags,
            "isLowEntropy": "low_entropy" in flags,
            "formatValid": is_valid
        }
    }
