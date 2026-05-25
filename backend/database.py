import sqlite3
import os
import random
from datetime import datetime, timedelta

DB_FILE = "pharmacy.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create inventory table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medicine_name TEXT NOT NULL,
            batch_number TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            min_stock_threshold INTEGER NOT NULL,
            expiry_date TEXT NOT NULL
        )
    """)
    
    # Create procurement_orders table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS procurement_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medicine_name TEXT NOT NULL,
            ordered_quantity INTEGER NOT NULL,
            status TEXT NOT NULL,
            order_date TEXT NOT NULL
        )
    """)
    
    # Create dispense_history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS dispense_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medicine_name TEXT NOT NULL,
            quantity_dispensed INTEGER NOT NULL,
            remaining_quantity INTEGER NOT NULL,
            is_critical BOOLEAN NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)
    
    # Check if we need to seed the data
    cursor.execute("SELECT COUNT(*) FROM inventory")
    count = cursor.fetchone()[0]
    
    if count == 0:
        today = datetime.now()
        
        medicines = [
            "Paracetamol", "Amoxicillin", "Ibuprofen", "Cetirizine", "Omeprazole",
            "Azithromycin", "Metformin", "Amlodipine", "Losartan", "Atorvastatin",
            "Levothyroxine", "Albuterol", "Gabapentin", "Hydrochlorothiazide", "Sertraline",
            "Furosemide", "Fluticasone", "Pantoprazole", "Escitalopram", "Meloxicam",
            "Citalopram", "Trazodone", "Rosuvastatin", "Carvedilol", "Tramadol",
            "Clopidogrel", "Montelukast", "Duloxetine", "Fluoxetine", "Bupropion"
        ]
        
        seed_data = []
        for i, name in enumerate(medicines):
            batch = f"BATCH-10{i+1}"
            
            # Randomize states to show diverse statuses
            rand_val = random.random()
            if rand_val < 0.1:
                # 10% chance of expired
                days_offset = random.randint(-60, -1)
                qty = random.randint(20, 200)
            elif rand_val < 0.25:
                # 15% chance of near expiry (<= 30 days)
                days_offset = random.randint(1, 29)
                qty = random.randint(20, 200)
            elif rand_val < 0.4:
                # 15% chance of low stock
                days_offset = random.randint(100, 400)
                qty = random.randint(5, 50) # Assuming threshold is 100
            else:
                # Healthy
                days_offset = random.randint(100, 400)
                qty = random.randint(150, 500)
                
            expiry = (today + timedelta(days=days_offset)).strftime("%Y-%m-%d")
            min_threshold = random.randint(30, 150)
            
            seed_data.append((name, batch, qty, min_threshold, expiry))
        
        cursor.executemany("""
            INSERT INTO inventory (medicine_name, batch_number, quantity, min_stock_threshold, expiry_date)
            VALUES (?, ?, ?, ?, ?)
        """, seed_data)
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized with 30 medicines successfully.")
