import React, { useState } from "react";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CouponsManagement = ({ coupons, onDelete, onAdd }) => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'cart_percent',
        discount_value: '',
        min_order_value: '0',
        usage_limit: '100',
        expiry_date: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onAdd(formData);
        setShowModal(false);
        setFormData({
            code: '',
            discount_type: 'cart_percent',
            discount_value: '',
            min_order_value: '0',
            usage_limit: '100',
            expiry_date: ''
        });
    };

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Active Coupons</h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                >
                    Generate Coupon
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Code</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Discount</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Min. Order</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Usage</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Expiry</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {coupons.length > 0 ? coupons.map((cp) => (
                            <tr key={cp.coupon_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4 font-black text-indigo-600 tracking-tighter">{cp.code}</td>
                                <td className="px-8 py-4">
                                    <span className="font-bold text-gray-900">
                                        {(cp.type || cp.discount_type || '').includes('percent') ? `${cp.value || cp.discount_value}%` : `$${cp.value || cp.discount_value}`}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-gray-500 font-medium">${cp.min_cart_value || cp.min_order_value}</td>
                                <td className="px-8 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-gray-700">{cp.used_count || 0} / {cp.usage_limit || 0}</span>
                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="bg-indigo-600 h-full" style={{ width: `${cp.usage_limit > 0 ? ((cp.used_count || 0) / (cp.usage_limit || 1)) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-gray-400 text-xs text-nowrap">
                                    {cp.expiry_date ? new Date(cp.expiry_date).toLocaleDateString() : 'No Limit'}
                                </td>
                                <td className="px-8 py-4">
                                    <button onClick={() => onDelete(cp.coupon_id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-medium italic">No coupons available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
                    <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">New Coupon</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                                    placeholder="e.g. SUMMER2024"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-1 py-2.5 text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="cart_percent">Percentage Off Cart</option>
                                        <option value="cart_fixed">Fixed Amount Off Cart</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Value</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.discount_value}
                                        onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. 10"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Min Order ($)</label>
                                    <input
                                        type="number"
                                        value={formData.min_order_value}
                                        onChange={e => setFormData({ ...formData, min_order_value: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={formData.usage_limit}
                                        onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.expiry_date}
                                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl uppercase tracking-light hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mt-4">
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CouponsManagement;
