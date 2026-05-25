# Smart Pharmacy Inventory Management System

A full-stack, enterprise-grade academic prototype for an automated inventory and expiration tracking system tailored for pharmacies.

## 🚀 Overview

The **Smart Pharmacy System** is built to automatically track medicine stock, expiry dates, and automated procurement orders. It features a modern, reactive dashboard with advanced charting, a simulation environment for stock adjustments, and a background engine that continually tests the system's resilience by simulating sales in real-time.

### Key Features
- **Real-Time Dashboard**: See live inventory health, critical low-stock alerts, and expiry warnings visualized via `recharts` (Bar, Pie, Area, and Composed charts).
- **Automated Replenishment**: The system scans for medicines dipping beneath their dynamically assigned thresholds and autonomously generates procurement orders.
- **Background Simulation (Cron Job)**: A built-in Python background task randomly dispenses medicines every 60 seconds, proving the system's ability to handle concurrent updates.
- **Server-Sent Events (SSE)**: The backend pushes real-time activity notifications to the React frontend, instantly updating graphs and transaction logs without requiring manual page refreshes.
- **Enterprise Authentication**: Secured behind a lightweight, clean login portal.
- **Expiration Enforcement**: Safe-guards prevent dispensing any medicine that has passed its expiration date, and allows admins to permanently discard near-expiry stock.

---

## 🛠️ Technology Stack

**Backend**:
- Python 3.10+
- FastAPI & Uvicorn (ASGI web server)
- SQLite3 (Local file-based database: `pharmacy.db`)
- Asyncio (For background cron jobs)

**Frontend**:
- React 19 (via Vite)
- Tailwind CSS v4 (Utility-first styling)
- Recharts (Data visualization)
- Lucide React (Iconography)

---

## ⚙️ Installation & Setup

### Prerequisites
Make sure you have installed:
- [Python 3.x](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/) (which includes `npm`)

### 1. Backend Setup
The backend utilizes FastAPI to serve data and stream events.

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. *(Optional)* Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *Note: Upon starting for the first time, `database.py` will automatically create `pharmacy.db` and seed it with 30 diverse medicines.*

### 2. Frontend Setup
The frontend is a Vite-powered React application.

1. Open a **new** terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the necessary Node packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 🖥️ Usage Guide

1. **Access the Portal**: Open your browser and navigate to the local Vite URL (usually `http://localhost:5173` or `http://localhost:5174`).
2. **Login**: 
   - **Administrator ID**: `admin`
   - **Password**: `password`
3. **Navigate the Dashboard**:
   - **Dashboard Tab**: View high-level metrics, pending procurement requests, Top-10 stock graphs, and the real-time "Recent Dispense Activity Log".
   - **Inventory & Simulation Tab**: Inspect the exact expiry dates and minimum thresholds for all 30 medicines. Use this tab to manually add stock or permanently discard medicines that are near or past their expiry.
4. **Observe the Automation**: Leave the dashboard open for at least 60 seconds. You will see a toast notification pop up indicating the Cron Job has simulated a sale, and your charts will automatically redraw themselves using the SSE stream.

---

## 📁 Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application, Cron Job, and Lifespan manager
│   ├── database.py          # SQLite connection and 30-item seeder script
│   ├── schemas.py           # Pydantic data validation models
│   ├── requirements.txt     # Python dependencies
│   └── routers/             # API Route handlers
│       ├── admin.py         # Auto-replenish algorithms
│       ├── dispense.py      # Manual dispensing and low-stock checks
│       ├── inventory.py     # Inventory fetching, stock adding, and history logs
│       └── stream.py        # Server-Sent Events (SSE) notification publisher
│
└── frontend/
    ├── package.json         # Node dependencies (Vite, React, Tailwind, Recharts)
    ├── tailwind.config.js   # Tailwind v4 configuration
    └── src/
        ├── App.jsx                 # Main state, Auth, SSE listener, and Layout
        ├── index.css               # Global CSS and Tailwind imports
        ├── main.jsx                # React DOM root
        └── components/
            ├── DashboardTab.jsx    # Recharts rendering and Activity logs
            ├── InventoryPanel.jsx  # Config table for Adding/Discarding stock
            └── AnalyticsPanel.jsx  # System alerts and Auto-Replenish buttons
```
