import React, { useState } from 'react';
import { HeartIcon } from "@heroicons/react/24/outline";
import ProductCard from "./ProductCard";

const UserWishlistTab = ({ wishlist, setWishlist, toggleLike, openDetails }) => {
    const [visibleCount, setVisibleCount] = useState(6);
    return (
        <div className="bg-white rounded-[40px] p-6 md:p-10 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">My Wishlist</h3>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{wishlist.length} Items Liked</span>
            </div>

            {wishlist.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.slice(0, visibleCount).map((product) => (
                            <ProductCard
                                key={product.product_id}
                                product={product}
                                isLiked={true}
                                onToggleLike={async (id) => {
                                    await toggleLike(id);
                                    setWishlist(prev => prev.filter(p => (p.product_id || p.id) !== id));
                                }}
                                onViewDetails={openDetails}
                            />
                        ))}
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        {visibleCount < wishlist.length && (
                            <button
                                onClick={() => setVisibleCount(prev => prev + 6)}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 transition"
                            >
                                Load More
                            </button>
                        )}

                        {visibleCount > 6 && (
                            <button
                                onClick={() => setVisibleCount(prev => Math.max(6, prev - 6))}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-300 transition"
                            >
                                Show Less
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200">
                    <HeartIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Your wishlist is empty</p>
                </div>
            )}
        </div>
    );
};

export default UserWishlistTab;
