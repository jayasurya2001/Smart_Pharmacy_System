from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_db_connection
from routers import inventory, dispense, admin, stream
from contextlib import asynccontextmanager
import asyncio
import random
from datetime import datetime

async def auto_dispense_cron():
    while True:
        await asyncio.sleep(60) # Run every 1 minute
        
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, medicine_name, quantity, min_stock_threshold FROM inventory WHERE quantity > 0")
            items = cursor.fetchall()
            
            if items:
                item = random.choice(items)
                qty_to_dispense = random.randint(1, min(10, item["quantity"]))
                new_qty = item["quantity"] - qty_to_dispense
                
                cursor.execute("UPDATE inventory SET quantity = ? WHERE id = ?", (new_qty, item["id"]))
                
                is_critical = new_qty <= item["min_stock_threshold"]
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cursor.execute("""
                    INSERT INTO dispense_history (medicine_name, quantity_dispensed, remaining_quantity, is_critical, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                """, (item["medicine_name"], qty_to_dispense, new_qty, is_critical, now_str))
                
                conn.commit()
                
                # Notify clients
                await stream.notify_clients(f"dispensed:{item['medicine_name']}:{qty_to_dispense}")
            
            conn.close()
        except Exception as e:
            print(f"Cron error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    task = asyncio.create_task(auto_dispense_cron())
    yield
    task.cancel()

app = FastAPI(title="Pharmacy System API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inventory.router)
app.include_router(dispense.router)
app.include_router(admin.router)
app.include_router(stream.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Smart Pharmacy System API is running"}
