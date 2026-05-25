from pydantic import BaseModel
from typing import Optional

class InventoryItem(BaseModel):
    id: int
    medicine_name: str
    batch_number: str
    quantity: int
    min_stock_threshold: int
    expiry_date: str
    status: Optional[str] = None

class DispenseRequest(BaseModel):
    item_id: int
    quantity: int

class DispenseResponse(BaseModel):
    message: str
    triggered_low_stock_alert: bool
    remaining_quantity: int
    
class AutoReplenishResponse(BaseModel):
    message: str
    total_orders_generated: int

class ProcurementOrder(BaseModel):
    id: int
    medicine_name: str
    ordered_quantity: int
    status: str
    order_date: str
