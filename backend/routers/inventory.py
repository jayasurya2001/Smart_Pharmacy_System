from fastapi import APIRouter
from typing import List
from datetime import datetime
from database import get_db_connection
from schemas import InventoryItem

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

def calculate_status(quantity: int, min_threshold: int, expiry_date_str: str) -> str:
    expiry_date = datetime.strptime(expiry_date_str, "%Y-%m-%d")
    today = datetime.now()
    days_to_expiry = (expiry_date - today).days

    if days_to_expiry < 0:
        return "CRITICAL: EXPIRED"
    elif days_to_expiry <= 30:
        return "WARNING: NEAR EXPIRY"
    elif quantity <= min_threshold:
        return "LOW STOCK"
    else:
        return "HEALTHY"

@router.get("", response_model=List[InventoryItem])
def get_inventory():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inventory")
    rows = cursor.fetchall()
    
    items = []
    for row in rows:
        item = dict(row)
        item["status"] = calculate_status(item["quantity"], item["min_stock_threshold"], item["expiry_date"])
        items.append(item)
        
    conn.close()
    return items

from pydantic import BaseModel

class AddStockRequest(BaseModel):
    item_id: int
    quantity: int

@router.post("/add")
def add_stock(req: AddStockRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT quantity FROM inventory WHERE id = ?", (req.item_id,))
    item = cursor.fetchone()
    if not item:
        conn.close()
        return {"error": "Item not found"}
    
    new_qty = item["quantity"] + req.quantity
    cursor.execute("UPDATE inventory SET quantity = ? WHERE id = ?", (new_qty, req.item_id))
    conn.commit()
    conn.close()
    return {"message": "Stock added successfully"}

@router.post("/history")
def add_history(req: AddStockRequest): # just a placeholder if needed, but not used.
    pass

class DiscardRequest(BaseModel):
    item_id: int

@router.post("/discard")
def discard_medicine(req: DiscardRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT medicine_name, quantity FROM inventory WHERE id = ?", (req.item_id,))
    item = cursor.fetchone()
    if not item:
        conn.close()
        return {"error": "Item not found"}
    
    # Set quantity to 0
    cursor.execute("UPDATE inventory SET quantity = 0 WHERE id = ?", (req.item_id,))
    
    # Optionally record in history
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO dispense_history (medicine_name, quantity_dispensed, remaining_quantity, is_critical, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (item["medicine_name"], item["quantity"], 0, True, now_str))
    
    conn.commit()
    conn.close()
    return {"message": "Medicine stock discarded successfully"}

@router.get("/history")
def get_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM dispense_history ORDER BY id DESC LIMIT 20")
    rows = cursor.fetchall()
    
    history = [dict(row) for row in rows]
    conn.close()
    return history

