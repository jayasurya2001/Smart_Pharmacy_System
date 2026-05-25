import React, { useState, useEffect } from 'react';
import InventoryPanel from './components/InventoryPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import DashboardTab from './components/DashboardTab';
import { LayoutDashboard, PackageSearch, LogOut } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

function App() {
    const [isAuthenticated, setIsAuth] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('Dashboard');
    
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'password') {
            setIsAuth(true);
            setNotification({ message: 'Login successful', type: 'success' });
            setTimeout(() => setNotification(null), 3000);
        } else {
            setNotification({ message: 'Invalid credentials', type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const fetchData = async () => {
        try {
            const [invRes, ordRes, histRes] = await Promise.all([
                fetch(`${API_BASE}/inventory`),
                fetch(`${API_BASE}/admin/orders`),
                fetch(`${API_BASE}/inventory/history`)
            ]);
            
            if (invRes.ok) {
                const invData = await invRes.json();
                setInventory(invData);
            }
            if (ordRes.ok) {
                const ordData = await ordRes.json();
                setOrders(ordData);
            }
            if (histRes.ok) {
                const histData = await histRes.json();
                setHistory(histData);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    // SSE connection for immediate updates
    useEffect(() => {
        if (!isAuthenticated) return;
        
        fetchData(); // Initial load
        
        const eventSource = new EventSource(`${API_BASE}/stream`);
        eventSource.onmessage = (event) => {
            console.log("SSE Event:", event.data);
            if (event.data.startsWith("dispensed:")) {
                const parts = event.data.split(':');
                const medName = parts[1];
                const qty = parts[2];
                showNotification(`Cron: Dispensed ${qty} units of ${medName}`, "warning");
                fetchData();
            }
        };

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [isAuthenticated]);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDiscardStock = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/inventory/discard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: id })
            });
            const data = await res.json();
            
            if (res.ok) {
                showNotification(data.message, "success");
                fetchData(); 
            } else {
                showNotification(data.detail || "Failed to discard", "error");
            }
        } catch (error) {
            showNotification("Network error occurred.", "error");
        }
    };

    const handleAddStock = async (id, quantity) => {
        try {
            const res = await fetch(`${API_BASE}/inventory/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: id, quantity })
            });
            const data = await res.json();
            
            if (res.ok) {
                showNotification(data.message, "success");
                fetchData(); 
            } else {
                showNotification(data.detail || "Failed to add stock", "error");
            }
        } catch (error) {
            showNotification("Network error occurred.", "error");
        }
    };

    const handleAutoReplenish = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/auto-replenish`, {
                method: 'POST'
            });
            const data = await res.json();
            
            if (res.ok) {
                showNotification(`${data.message} Generated ${data.total_orders_generated} new orders.`, "success");
                fetchData(); 
            } else {
                showNotification(data.detail || "Failed to run auto-replenish", "error");
            }
        } catch (error) {
            showNotification("Network error occurred.", "error");
        }
    };

    // --- Login Screen ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                {notification && (
                    <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow text-white ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {notification.message}
                    </div>
                )}
                <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-inner mb-6">
                            <span className="text-white font-bold text-2xl">+</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">SmartPharma</h2>
                        <p className="text-gray-500 text-sm mb-8">Sign in to the Enterprise Management Portal.</p>
                        
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Administrator ID</label>
                                <input 
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition"
                                    placeholder="Enter admin username"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow">
                                Authenticate
                            </button>
                        </form>
                    </div>
                    <div className="bg-gray-50 border-t border-gray-100 p-4 text-center text-xs text-gray-500">
                        Secure Enterprise Authentication System v2.1
                    </div>
                </div>
            </div>
        );
    }

    // --- Dashboard Application ---
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-inner">
                            <span className="text-white font-bold text-xl">+</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Smart<span className="text-indigo-600">Pharma</span></h1>
                    </div>
                    
                    <nav className="flex space-x-1">
                        <button 
                            onClick={() => setActiveTab('Dashboard')}
                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition ${activeTab === 'Dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <LayoutDashboard size={18} className="mr-2" />
                            Dashboard
                        </button>
                        <button 
                            onClick={() => setActiveTab('Inventory')}
                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition ${activeTab === 'Inventory' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <PackageSearch size={18} className="mr-2" />
                            Inventory & Simulation
                        </button>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Admin Session
                        </span>
                        <button onClick={() => setIsAuth(false)} className="text-gray-500 hover:text-red-600 transition" title="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-20 right-8 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden z-50 transform transition-all duration-300 ease-in-out ${
                    notification.type === 'error' ? 'bg-red-500' : notification.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                    <div className="p-4 flex items-center">
                        <div className="ml-3 w-0 flex-1 pt-0.5">
                            <p className="text-sm font-medium text-white">
                                {notification.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'Dashboard' && (
                            <DashboardTab 
                                inventory={inventory}
                                orders={orders}
                                history={history}
                                onAutoReplenish={handleAutoReplenish}
                            />
                        )}
                        
                        {activeTab === 'Inventory' && (
                            <div className="flex flex-col lg:flex-row gap-8">
                                <InventoryPanel 
                                    inventory={inventory} 
                                    onDiscardStock={handleDiscardStock} 
                                    onAddStock={handleAddStock}
                                />
                                <AnalyticsPanel 
                                    inventory={inventory} 
                                    orders={orders} 
                                    onAutoReplenish={handleAutoReplenish} 
                                />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
