import React from 'react';

const CartPromoCode = ({ couponCode, setCouponCode, handleApplyCoupon, couponMsg, appliedCoupon }) => {
    return (
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Promo Code</span>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Enter Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-gray-50 border border-transparent rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                />

                <button
                    onClick={handleApplyCoupon}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-700 transition-colors"
                >
                    Apply
                </button>
            </div>
            {/* Message */}
            {couponMsg.text && (
                <p className={`text-[10px] font-bold ${couponMsg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                    {couponMsg.text}
                </p>
            )}
            {appliedCoupon && (
                <div className="flex justify-between items-center bg-green-50 p-2 rounded-lg border border-green-100">
                    <span className="text-[10px] font-bold text-green-700">{appliedCoupon.code} Applied</span>
                </div>
            )}
        </div>
    );
};

export default CartPromoCode;
