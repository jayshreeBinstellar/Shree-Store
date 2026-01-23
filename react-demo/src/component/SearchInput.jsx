import React, { useState } from 'react'

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const SearchInput = ({ onSearch }) => {
    const [search, setSearch] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (typeof onSearch === "function") onSearch(search);
        }
    };

    const triggerSearch = () => {
        if (typeof onSearch === "function") onSearch(search);
    };

    return (
        <div className="relative w-full group">
            <div className="flex items-center h-14 bg-gray-50 border-2 border-transparent group-focus-within:border-indigo-600 group-focus-within:bg-white rounded-2xl transition-all duration-300 shadow-sm group-focus-within:shadow-indigo-100 group-focus-within:shadow-2xl overflow-hidden">
                <div className="px-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <SearchOutlinedIcon className="!w-6 !h-6" />
                </div>
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent outline-none w-full text-base font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="Search fresh products, electronics..."
                />
                <button
                    onClick={triggerSearch}
                    className="h-full bg-gray-900 text-white px-8 font-bold hover:bg-black transition-colors hidden sm:block active:bg-indigo-700"
                >
                    Search
                </button>
            </div>

            {/* Quick stats/tag mockups for style */}
            <div className="absolute -bottom-6 left-2 flex gap-4 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter cursor-pointer hover:text-indigo-600">Laptops</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter cursor-pointer hover:text-indigo-600">Fresh Fruits</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter cursor-pointer hover:text-indigo-600">Shoes</span>
            </div>
        </div>
    );
};

export default SearchInput
