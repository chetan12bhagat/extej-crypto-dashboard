import os
import json
import boto3
from boto3.dynamodb.conditions import Key
from app.config import settings

_dynamodb = None
_use_mock = False

def get_dynamodb():
    global _dynamodb, _use_mock
    if _dynamodb is None:
        try:
            _dynamodb = boto3.resource(
                "dynamodb",
                region_name=settings.aws_region,
                endpoint_url="http://localhost:8000" if settings.dynamo_table_name == "extej-users-local" else None,
            )
            # Test connection
            _dynamodb.meta.client.list_tables()
        except Exception:
            print("⚠️ Could not connect to DynamoDB Local. Falling back to local db.json mock.")
            _use_mock = True
    return _dynamodb

def _load_mock_db():
    db_path = os.path.join(os.path.dirname(__file__), "../../db.json")
    if not os.path.exists(db_path):
        return []
    with open(db_path, "r") as f:
        return json.load(f)

def _save_mock_db(data):
    db_path = os.path.join(os.path.dirname(__file__), "../../db.json")
    with open(db_path, "w") as f:
        json.dump(data, f, indent=2)

def get_table():
    return get_dynamodb().Table(settings.dynamo_table_name)

# ── Generic helpers ──

def get_item(pk: str, sk: str) -> dict | None:
    if _use_mock:
        db = _load_mock_db()
        return next((i for i in db if i["PK"] == pk and i["SK"] == sk), None)
    
    table = get_table()
    resp = table.get_item(Key={"PK": pk, "SK": sk})
    return resp.get("Item")

def put_item(item: dict) -> None:
    if _use_mock:
        db = _load_mock_db()
        # Remove existing if same keys
        db = [i for i in db if not (i["PK"] == item["PK"] and i["SK"] == item["SK"])]
        db.append(item)
        _save_mock_db(db)
        return

    get_table().put_item(Item=item)

def update_item(pk: str, sk: str, updates: dict) -> dict:
    if _use_mock:
        db = _load_mock_db()
        item = next((i for i in db if i["PK"] == pk and i["SK"] == sk), None)
        if item:
            item.update(updates)
            _save_mock_db(db)
            return item
        return {}

    table = get_table()
    expr = "SET " + ", ".join(f"#k{i} = :v{i}" for i, k in enumerate(updates))
    names = {f"#k{i}": k for i, k in enumerate(updates)}
    values = {f":v{i}": v for i, v in enumerate(updates.values())}
    resp = table.update_item(
        Key={"PK": pk, "SK": sk},
        UpdateExpression=expr,
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=values,
        ReturnValues="ALL_NEW",
    )
    return resp.get("Attributes", {})

def delete_item(pk: str, sk: str) -> None:
    if _use_mock:
        db = _load_mock_db()
        db = [i for i in db if not (i["PK"] == pk and i["SK"] == sk)]
        _save_mock_db(db)
        return

    get_table().delete_item(Key={"PK": pk, "SK": sk})

def query_items(pk: str, sk_prefix: str | None = None) -> list[dict]:
    if _use_mock:
        db = _load_mock_db()
        items = [i for i in db if i["PK"] == pk]
        if sk_prefix:
            items = [i for i in items if i["SK"].startswith(sk_prefix)]
        return items

    table = get_table()
    if sk_prefix:
        resp = table.query(
            KeyConditionExpression=Key("PK").eq(pk) & Key("SK").begins_with(sk_prefix)
        )
    else:
        resp = table.query(KeyConditionExpression=Key("PK").eq(pk))
    return resp.get("Items", [])
