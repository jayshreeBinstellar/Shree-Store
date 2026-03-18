import React from 'react';
import { getThumbnailSrc } from "../utils/imageUtils";
import { Link } from 'react-router-dom';

const CartItemsList = ({ cart, handleRemove, handleQtyChange, onClose }) => {
    if (cart.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-7xl opacity-10">🛒</div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Basket Empty</h3>
                    <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">Start adding fresh products</p>
                </div>
                <Link
                    to={"/main/dashboard"}
                    onClick={onClose}
                    className="cursor-pointer bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-gray-900 transition-all shadow-md"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {cart.map(item => {
                const discountPerItem = (item.price * (item.discountPercentage || 0)) / 100;
                const discountedPrice = item.price - discountPerItem;

                return (
                    <div
                        key={item.id}
                        className="group relative flex gap-3 bg-gray-50/50 p-2.5 rounded-xl border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300"
                    >
                        <div className="h-16 w-16 bg-white rounded-lg shrink-0 flex items-center justify-center p-1.5 shadow-sm">
                            <img
                                src={getThumbnailSrc(item.thumbnail)}
                                className="h-full w-full object-contain mix-blend-multiply"
                                alt={item.title}
                            />
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-0.5">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900 tracking-tight leading-tight line-clamp-1 text-sm">{item.title}</h3>
                                <button
                                    onClick={() => handleRemove(item.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                                {item.brand || "Premium"}
                            </p>

                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-sm font-black text-gray-900">${discountedPrice.toFixed(2)}</span>
                                    {(discountPerItem > 0 || item.old_price) && (
                                        <>
                                            <span className="text-[9px] text-gray-400 line-through font-medium">
                                                ${discountPerItem > 0 ? item.price : Number(item.old_price).toFixed(2)}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center bg-white border border-gray-100 rounded-lg p-0.5 shadow-sm">
                                    <button
                                        onClick={() => handleQtyChange(item.id, "dec")}
                                        className="w-5 h-5 flex items-center justify-center hover:bg-gray-50 rounded transition-colors font-black text-gray-400 hover:text-indigo-600"
                                    >
                                        −
                                    </button>
                                    <span className="w-5 text-center text-[10px] font-black text-gray-900">{item.qty}</span>
                                    <button
                                        onClick={() => handleQtyChange(item.id, "inc")}
                                        className="w-5 h-5 flex items-center justify-center hover:bg-gray-50 rounded transition-colors font-black text-gray-400 hover:text-indigo-600"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CartItemsList;
