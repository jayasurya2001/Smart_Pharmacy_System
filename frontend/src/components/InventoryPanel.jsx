import React, { useState } from 'react';
import { Plus, PackageMinus, Trash2 } from 'lucide-react';

const getStatusBadge = (status) => {
    if (status === "CRITICAL: EXPIRED") return "bg-red-100 text-red-800 border-red-200";
    if (status === "WARNING: NEAR EXPIRY") return "bg-orange-100 text-orange-800 border-orange-200";
    if (status === "LOW STOCK") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
};

export default function InventoryPanel({ inventory, onAddStock, onDiscardStock }) {
    const [addInputs, setAddInputs] = useState({});

    const handleAddStock = (id) => {
        const qty = parseInt(addInputs[id], 10);
        if (qty > 0) {
            onAddStock(id, qty);
            setAddInputs({ ...addInputs, [id]: "" });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <PackageMinus className="w-5 h-5 mr-2 text-indigo-600" />
                Live Pharmacy Stock Index & Configuration
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-y border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            <th className="p-4">Medicine</th>
                            <th className="p-4">Batch</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Expiry Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Add Stock</th>
                            <th className="p-4 text-center">Discard Stock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {inventory.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-900">{item.medicine_name}</td>
                                <td className="p-4 text-gray-500">{item.batch_number}</td>
                                <td className="p-4 font-mono font-medium">{item.quantity} <span className="text-gray-400 text-xs">/ {item.min_stock_threshold}</span></td>
                                <td className="p-4">{item.expiry_date}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full border text-[10px] font-bold tracking-wide uppercase ${getStatusBadge(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            placeholder="Qty" 
                                            className="w-16 p-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                                            value={addInputs[item.id] || ''}
                                            onChange={(e) => setAddInputs({ ...addInputs, [item.id]: e.target.value })}
                                        />
                                        <button 
                                            onClick={() => handleAddStock(item.id)}
                                            disabled={!addInputs[item.id]}
                                            className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title="Add Stock"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => onDiscardStock(item.id)}
                                        disabled={item.status !== "WARNING: NEAR EXPIRY" && item.status !== "CRITICAL: EXPIRED"}
                                        className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
                                        title="Discard remaining stock due to expiry"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {inventory.length === 0 && (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-500">No inventory items found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
