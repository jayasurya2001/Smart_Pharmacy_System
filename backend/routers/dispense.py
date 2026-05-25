from fastapi import APIRouter, HTTPException
from database import get_db_connection
from schemas import DispenseRequest, DispenseResponse
from datetime import datetime

router = APIRouter(prefix="/api/dispense", tags=["dispense"])

@router.post("", response_model=DispenseResponse)
def dispense_medicine(req: DispenseRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM inventory WHERE id = ?", (req.item_id,))
    item = cursor.fetchone()
    
    if not item:
        conn.close()
        raise HTTPException(status_code=404, detail="Item not found")
        
    expiry_date = datetime.strptime(item["expiry_date"], "%Y-%m-%d")
    if (expiry_date - datetime.now()).days < 0:
        conn.close()
        raise HTTPException(status_code=400, detail="Cannot dispense. Item is EXPIRED.")
        
    if item["quantity"] < req.quantity:
        conn.close()
        raise HTTPException(status_code=400, detail="Insufficient stock")
        
    new_quantity = item["quantity"] - req.quantity
    cursor.execute("UPDATE inventory SET quantity = ? WHERE id = ?", (new_quantity, req.item_id))
    
    triggered_alert = new_quantity <= item["min_stock_threshold"]
    
    # Record in history
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO dispense_history (medicine_name, quantity_dispensed, remaining_quantity, is_critical, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (item["medicine_name"], req.quantity, new_quantity, triggered_alert, now_str))
    
    conn.commit()
    
    conn.close()
    
    return DispenseResponse(
        message=f"Successfully dispensed {req.quantity} units of {item['medicine_name']}",
        triggered_low_stock_alert=triggered_alert,
        remaining_quantity=new_quantity
    )
