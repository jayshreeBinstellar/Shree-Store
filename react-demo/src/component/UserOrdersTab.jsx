import React, { useState } from 'react';
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import OrderStatusTimeline from "./OrderStatusTimeline";
import { getThumbnailSrc } from "../utils/imageUtils";

const UserOrdersTab = ({ orderHistory, openDetails, handleOpenInvoice, navigate }) => {
    const [visibleCount, setVisibleCount] = useState(3);
    return (
        <div className="bg-white rounded-[40px] p-3 md:p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">Recent Purchase</h3>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{orderHistory.length} Total Orders</span>
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-50 text-left">
                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Details</th>
                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking Status</th>
                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orderHistory.slice(0, visibleCount).map((order) => (
                            <tr key={order.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer" onClick={() => handleOpenInvoice(order)}>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-900 mb-2 truncate max-w-37.5">{order.id}</span>
                                        <span className="text-xs text-gray-400 font-bold mb-4">{order.date}</span>
                                        <div className="flex flex-wrap gap-2">
                                            {order.items.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={(e) => { e.stopPropagation(); openDetails(item.product_id, order.status?.toLowerCase() === 'delivered'); }}
                                                    className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-1 cursor-pointer hover:border-indigo-600 transition-all hover:scale-110"
                                                    title={item.title}
                                                >
                                                    <img src={getThumbnailSrc(item.thumbnail)} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className={`flex flex-col ${order.status?.toLowerCase() === 'delivered' ? 'gap-2' : 'gap-1'}`}>
                                        <span className={`w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                                        {order.status?.toLowerCase() !== 'delivered' && <div className="w-full max-w-87.5 pr-4"><OrderStatusTimeline status={order.status} /></div>}
                                    </div>
                                </td>
                                <td className="p-4 font-black text-gray-900 text-right text-lg">{order.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-6">
                {orderHistory.slice(0, visibleCount).map((order) => (
                    <div key={order.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100" onClick={() => handleOpenInvoice(order)}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-black text-gray-900">{order.id}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{order.date}</p>
                            </div>
                            <span className="text-lg font-black text-indigo-600">{order.total}</span>
                        </div>
                        <div className={`space-y-${order.status?.toLowerCase() === 'delivered' ? '1' : '4'}`}>
                            <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                            {order.status?.toLowerCase() !== 'delivered' && <OrderStatusTimeline status={order.status} />}
                        </div>
                    </div>
                ))}
            </div>

            {orderHistory.length > 0 && (
                <div className="flex justify-center gap-4 mt-6">
                    {visibleCount < orderHistory.length && (
                        <button
                            onClick={() => setVisibleCount(prev => prev + 3)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 transition"
                        >
                            Load More
                        </button>
                    )}

                    {visibleCount > 3 && (
                        <button
                            onClick={() => setVisibleCount(3)}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-300 transition"
                        >
                            Load Less
                        </button>
                    )}
                </div>
            )}

            {orderHistory.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><ShoppingBagIcon className="w-8 h-8 text-gray-200" /></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No orders placed yet</p>
                    <button onClick={() => navigate("/")} className="mt-6 text-indigo-600 font-black text-sm hover:underline">Start Exploring Products</button>
                </div>
            )}
        </div>
    );
};

export default UserOrdersTab;
