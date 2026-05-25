from fastapi import APIRouter
from typing import List
from datetime import datetime
from database import get_db_connection
from schemas import AutoReplenishResponse, ProcurementOrder

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/auto-replenish", response_model=AutoReplenishResponse)
def auto_replenish():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM inventory")
    inventory = cursor.fetchall()
    
    orders_generated = 0
    today_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    for item in inventory:
        expiry_date = datetime.strptime(item["expiry_date"], "%Y-%m-%d")
        days_to_expiry = (expiry_date - datetime.now()).days
        
        # Don't auto-replenish if expired. 
        # Check if quantity <= min_stock_threshold
        if item["quantity"] <= item["min_stock_threshold"] and days_to_expiry >= 0:
            # Check if there's already a pending order for this medicine
            cursor.execute(
                "SELECT COUNT(*) FROM procurement_orders WHERE medicine_name = ? AND status = 'PENDING'", 
                (item["medicine_name"],)
            )
            has_pending = cursor.fetchone()[0] > 0
            
            if not has_pending:
                suggested_quantity = 100
                cursor.execute("""
                    INSERT INTO procurement_orders (medicine_name, ordered_quantity, status, order_date)
                    VALUES (?, ?, ?, ?)
                """, (item["medicine_name"], suggested_quantity, 'PENDING', today_str))
                orders_generated += 1
                
    conn.commit()
    conn.close()
    
    return AutoReplenishResponse(
        message=f"Auto-replenish engine ran successfully.",
        total_orders_generated=orders_generated
    )

@router.get("/orders", response_model=List[ProcurementOrder])
def get_orders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM procurement_orders ORDER BY id DESC")
    rows = cursor.fetchall()
    
    orders = [dict(row) for row in rows]
    conn.close()
    return orders
