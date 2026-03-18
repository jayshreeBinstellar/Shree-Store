import React from "react";

const ProductSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl p-3 border border-gray-100 h-full flex flex-col animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
            <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-5 w-full bg-gray-200 rounded"></div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    );
};

export default ProductSkeleton;
