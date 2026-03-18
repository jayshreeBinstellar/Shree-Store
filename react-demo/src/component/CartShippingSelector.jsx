import React from 'react';

const CartShippingSelector = ({ shippingOptions, selectedShippingId, setSelectedShippingId }) => {
    return (
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Shipping Method</span>
            <div className="space-y-1">
                {shippingOptions.map(option => (
                    <label key={option.shipping_id} className="flex items-center justify-between p-2 rounded-lg border border-gray-50 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="shipping"
                                className="text-indigo-600 focus:ring-indigo-500"
                                checked={selectedShippingId == option.shipping_id}
                                onChange={() => setSelectedShippingId(option.shipping_id)}
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-900">{option.name}</span>
                                <span className="text-[9px] text-gray-400">{option.estimated_days}</span>
                            </div>
                        </div>
                        <span className="text-xs font-black text-gray-900">${parseFloat(option.cost).toFixed(2)}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default CartShippingSelector;
