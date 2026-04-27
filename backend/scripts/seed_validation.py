import json
import os
import uuid
from datetime import datetime, timezone, timedelta

# Path to the mock database
DB_PATH = os.path.join(os.path.dirname(__file__), "../db.json")

def seed_validation_logs():
    if not os.path.exists(DB_PATH):
        print(f"Error: {DB_PATH} not found.")
        return

    with open(DB_PATH, "r") as f:
        try:
            db = json.load(f)
        except json.JSONDecodeError:
            db = []

    # Find a user to seed for
    user_id = "test-user-123"
    for item in db:
        if item.get("SK") == "PROFILE":
            user_id = item.get("userId")
            break
    
    print(f"Seeding validation logs for user: {user_id}")

    pk = f"USER#{user_id}"
    now = datetime.now(timezone.utc)

    logs = [
        {
            "PK": pk,
            "SK": f"VALIDATION#{uuid.uuid4()}",
            "logId": str(uuid.uuid4()),
            "type": "address",
            "input": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            "result": "valid",
            "riskScore": 5,
            "coin": "ETH",
            "checkedAt": (now - timedelta(hours=1)).isoformat(),
        },
        {
            "PK": pk,
            "SK": f"VALIDATION#{uuid.uuid4()}",
            "logId": str(uuid.uuid4()),
            "type": "address",
            "input": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            "result": "valid",
            "riskScore": 2,
            "coin": "BTC",
            "checkedAt": (now - timedelta(hours=3)).isoformat(),
        },
        {
            "PK": pk,
            "SK": f"VALIDATION#{uuid.uuid4()}",
            "logId": str(uuid.uuid4()),
            "type": "address",
            "input": "0x0000000000000000000000000000000000000000",
            "result": "invalid",
            "riskScore": 95,
            "coin": "ETH",
            "checkedAt": (now - timedelta(hours=5)).isoformat(),
        },
        {
            "PK": pk,
            "SK": f"VALIDATION#{uuid.uuid4()}",
            "logId": str(uuid.uuid4()),
            "type": "transaction",
            "input": "0x4e5a3977598806db3016419660bc2ba125376587ba2ca47ca624383c7486e680",
            "result": "valid",
            "riskScore": 10,
            "checkedAt": (now - timedelta(days=1)).isoformat(),
        },
    ]

    # Add to DB if not already there (avoid duplicates for same input in this run)
    for log in logs:
        # Simple check to avoid complete duplicates
        if not any(item.get("input") == log["input"] and item.get("PK") == pk for item in db):
            db.append(log)

    with open(DB_PATH, "w") as f:
        json.dump(db, f, indent=2)
    
    print(f"Successfully added {len(logs)} validation logs to db.json")

if __name__ == "__main__":
    seed_validation_logs()
