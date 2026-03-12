import React, { useState } from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useShop } from "../context/ShopContext";

const SearchInput = () => {
    const { searchTerm, setSearchTerm } = useShop();

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setSearchTerm(searchTerm.trim());
        }
    };

    return (
        <div className="relative w-full group">
            <div className="flex items-center h-14 bg-gray-50 border-2 border-transparent group-focus-within:border-indigo-600 group-focus-within:bg-white rounded-2xl transition-all duration-300 shadow-sm group-focus-within:shadow-indigo-100 group-focus-within:shadow-2xl overflow-hidden">
                <div className="px-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <SearchOutlinedIcon className="!w-6 !h-6" />
                </div>

                <input
                    type="search"
                    value={searchTerm}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent outline-none w-full text-base font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="Search products..."
                />

                <button
                    onClick={() => setSearchTerm(searchTerm.trim())}
                    className="h-full bg-gray-900 text-white px-8 font-bold hover:bg-black transition-colors hidden sm:block"
                >
                    Search
                </button>
            </div>
        </div>
    );
};

export default SearchInput;
