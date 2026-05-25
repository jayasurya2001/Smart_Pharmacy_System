import React from 'react';

export default function AnalyticsPanel({ inventory, orders, onAutoReplenish }) {
    const expiredCount = inventory.filter(i => i.status === "CRITICAL: EXPIRED").length;
    const lowStockCount = inventory.filter(i => i.status === "LOW STOCK").length;
    const pendingOrdersCount = orders.filter(o => o.status === "PENDING").length;

    return (
        <div className="w-full lg:w-96 flex flex-col space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    System Alerts
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-red-600">{expiredCount}</span>
                        <span className="text-xs font-semibold text-red-800 uppercase tracking-wide text-center mt-1">Expired</span>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-yellow-600">{lowStockCount}</span>
                        <span className="text-xs font-semibold text-yellow-800 uppercase tracking-wide text-center mt-1">Low Stock</span>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between mb-6">
                    <div>
                        <span className="block text-2xl font-black text-blue-600">{pendingOrdersCount}</span>
                        <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Pending Reorders</span>
                    </div>
                    <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>

                <button 
                    onClick={onAutoReplenish}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold shadow-md transform transition hover:-translate-y-0.5 flex items-center justify-center"
                >
                    <span className="mr-2">⚡</span> Run Automated Replenish Engine
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Procurement History</h3>
                <div className="overflow-y-auto flex-1 max-h-64 pr-2 space-y-3">
                    {orders.map(order => (
                        <div key={order.id} className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-900">{order.medicine_name}</span>
                                <span className="text-xs text-gray-500">{new Date(order.order_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-gray-600">Qty: <span className="font-mono font-medium">{order.ordered_quantity}</span></span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.status === 'PENDING' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="text-center text-gray-500 py-4 text-sm">
                            No procurement orders yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
