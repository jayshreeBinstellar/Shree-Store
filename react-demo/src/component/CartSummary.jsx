import React from 'react';

const CartSummary = ({ subtotal, baseDiscount, couponDiscount, appliedCoupon, shippingCost, taxRate, taxAmount, totalPayable, handleCheckout, checkingOut }) => {
    return (
        <>
            <div className="space-y-1.5 px-1">
                <div className="flex justify-between items-center bg-gray-100/50 p-1.5 rounded-lg">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
                    <span className="text-sm font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>

                {baseDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600 px-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Item Savings</span>
                        <span className="text-sm font-bold">- ${baseDiscount.toFixed(2)}</span>
                    </div>
                )}

                {couponDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600 px-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Coupon ({appliedCoupon?.code})</span>
                        <span className="text-sm font-bold">- ${couponDiscount.toFixed(2)}</span>
                    </div>
                )}

                <div className="flex justify-between items-center text-indigo-900 px-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest">Shipping</span>
                    <span className="text-sm font-bold">${shippingCost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-gray-500 px-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                    <span className="text-sm font-bold">${taxAmount.toFixed(2)}</span>
                </div>


                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-base font-black text-gray-900 uppercase tracking-tighter">Payable</span>
                    <span className="text-xl font-black text-indigo-600 tracking-tighter">
                        ${totalPayable.toFixed(2)}
                    </span>
                </div>
            </div>

            <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className={`w-full py-3 rounded-xl font-black text-base uppercase tracking-widest transition-all shadow-sm active:scale-95 group flex items-center justify-center gap-2
                ${checkingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
              `}
            >
                {checkingOut ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        Checkout Now
                        <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                    </>
                )}
            </button>
        </>
    );
};

export default CartSummary;
