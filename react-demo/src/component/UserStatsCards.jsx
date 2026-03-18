import React from 'react';
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

const UserStatsCards = ({ wishlistCount, cartCount, setActiveTab, openCart }) => {
    return (
        <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div onClick={() => setActiveTab("wishlist")} className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-indigo-600 transition-all cursor-pointer overflow-hidden relative">
                <div className="relative z-10">
                    <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">Favorites</p>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors mt-1">{wishlistCount}</h3>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform relative z-10">
                    <HeartIcon className="w-6 h-6 md:w-8 md:h-8 fill-rose-500" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-rose-50/30 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            </div>
            <div onClick={openCart} className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-indigo-600 transition-all cursor-pointer overflow-hidden relative">
                <div className="relative z-10">
                    <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">In Basket</p>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors mt-1">{cartCount}</h3>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform relative z-10">
                    <ShoppingBagIcon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50/30 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            </div>
        </div>
    );
};

export default UserStatsCards;
