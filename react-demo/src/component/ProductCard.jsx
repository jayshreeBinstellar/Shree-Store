import React from "react";
import { Button, Rating } from "@mui/material";
import { Favorite, FavoriteBorder, Visibility, LocalMall } from "@mui/icons-material";
import BASE_URL from "../api/ApiConstant";

const ProductCard = ({ product, isLiked, onToggleLike, onViewDetails }) => {
    const id = product.product_id || product.id;
    return (
        <div className="group relative bg-white rounded-2xl p-3 transition-all ease-in-out duration-300 hover:shadow-lg border border-gray-100 
        h-full flex flex-col ">
            {/* Image Container */}
            <div className="relative aspect-square  overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                <img
                    src={
                        product.thumbnail
                            ? product.thumbnail.startsWith("http")
                                ? product.thumbnail
                                : `${BASE_URL}${product.thumbnail}`
                            : "/no-image.png"
                    }
                    alt={product.title}
                    className="w-full h-full   object-cover  mix-blend-multiply transition-transform duration-700 group-hover:scale-115"
                />

                {/* Float Actions */}
                <div className="absolute top-0 right-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={() => onToggleLike && onToggleLike(id)}
                        className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                    >
                        {isLiked ? <Favorite className="text-red-500 w-4 h-4" /> : <FavoriteBorder className="text-gray-400 w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => onViewDetails && onViewDetails(id)}
                        className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                        <Visibility className="text-gray-400 w-4 h-4 hover:text-indigo-600" />
                    </button>
                </div>

                {/* Badge */}
                {(product.discount || product.old_price) && (
                    <div className="absolute top-1 left-1 bg-red-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm">
                        {product.discount || `${Math.round(((product.old_price - product.price) / product.old_price) * 100)}%`}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">
                        {product.brand || "Premium"}
                    </span>
                    <Rating value={product.rating || 0} readOnly size="small" precision={0.5} className="text-yellow-400 text-xs" />
                </div>

                <h3 className="text-gray-900 font-bold text-sm mb-1 line-clamp-1 leading-tight">
                    {product.title}
                </h3>

                <div className="flex items-center gap-2 mt-auto mb-2">
                    <span className="text-lg font-semibold text-gray-900">${product.price}</span>
                    {product.old_price && (
                        <span className="text-gray-400 line-through text-xs font-medium">${product.old_price}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ProductCard);
