import React from "react";
import { EyeIcon, PrinterIcon, ArrowPathIcon, TruckIcon } from "@heroicons/react/24/outline";
import MuiPagination from "../Pagination";


const OrdersManagement = ({ 
    orders, 
    onUpdateStatus, 
    onViewInvoice, 
    onEditShipping,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    isLoading = false,
    totalOrders = 0
}) => {
    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Recent Orders</h3>
                <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><ArrowPathIcon className="h-5 w-5" /></button>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orders.map((order) => (
                            <tr key={order.order_id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-4 font-black text-indigo-600">#{order.order_id}</td>
                                <td className="px-8 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{order.full_name}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4 font-black text-gray-900">${Number(order.total_amount).toFixed(2)}</td>
                                <td className="px-8 py-4">
                                    <select
                                        value={order.status}
                                        onChange={(e) => onUpdateStatus(order.order_id, e.target.value)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase outline-none border-2 transition-all ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                'bg-indigo-50 text-indigo-600 border-indigo-100'
                                            }`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEditShipping(order)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="Shipping Details"
                                        >
                                            <TruckIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => onViewInvoice(order)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="View Invoice"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Print Selection">
                                            <PrinterIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-8 py-12 text-center text-gray-400 font-medium">No orders found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <MuiPagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    isLoading={isLoading}
                    itemsTotal={totalOrders}
                />
            )}
        </div>
    );
};

export default OrdersManagement;
