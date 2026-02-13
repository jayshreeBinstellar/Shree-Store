import React from "react";

const CategoryFilter = ({ categories, selectedCategory, onSelect, loading }) => {
    if (loading) return <p className="text-gray-500">Loading categories...</p>;
    if (!categories.length) return <p className="text-gray-500">No categories available</p>;

    return (
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">Filter by Category:</h3>
                {selectedCategory && (
                    <button
                        onClick={() => onSelect(null)}
                        className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat.category_id}
                        onClick={() => onSelect(cat)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedCategory?.category_id === cat.category_id
                                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;
