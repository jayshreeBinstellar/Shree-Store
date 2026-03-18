import React, { useState } from "react";
import { Slider, Checkbox, FormControlLabel, Rating, Button } from "@mui/material";

const FilterSidebar = ({ onFilterChange, categories }) => {
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minRating, setMinRating] = useState(0);
    const [inStock, setInStock] = useState(false);

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const applyFilters = () => {
        onFilterChange({
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            category: selectedCategory,
            rating: minRating,
            stock: inStock ? "true" : ""
        });
    };

    const clearFilters = () => {
        setPriceRange([0, 1000]);
        setSelectedCategory("");
        setMinRating(0);
        setInStock(false);
        onFilterChange({});
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-8 sticky top-24">
            <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Price Range</h3>
                <Slider
                    value={priceRange}
                    onChange={handlePriceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                    sx={{ color: "#4f46e5" }}
                />
                <div className="flex justify-between text-xs font-bold text-gray-500 mt-2">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Category</h3>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Min Rating</h3>
                <div className="flex flex-col gap-2">
                    {[4, 3, 2, 1].map((stars) => (
                        <button
                            key={stars}
                            onClick={() => setMinRating(stars)}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${minRating === stars ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-50 text-gray-600"}`}
                        >
                            <Rating value={stars} readOnly size="small" />
                            <span className="text-xs font-bold">& Up</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Availability</h3>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={inStock}
                            onChange={(e) => setInStock(e.target.checked)}
                            sx={{ color: "#4f46e5", "&.Mui-checked": { color: "#4f46e5" } }}
                        />
                    }
                    label={<span className="text-sm font-bold text-gray-700">In Stock Only</span>}
                />
            </div>

            <div className="flex flex-col gap-3 pt-4">
                <Button
                    variant="contained"
                    onClick={applyFilters}
                    className="bg-indigo-600! hover:bg-indigo-700! rounded-xl! py-3! font-black! normal-case!"
                >
                    Apply Filters
                </Button>
                <button
                    onClick={clearFilters}
                    className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                >
                    Clear All
                </button>
            </div>
        </div>
    );
};

export default FilterSidebar;
