import React, { useState, cloneElement } from "react";
import { useNavigate } from "react-router-dom";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import LocalGroceryStoreOutlinedIcon from "@mui/icons-material/LocalGroceryStoreOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ToysOutlinedIcon from "@mui/icons-material/ToysOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import Button from "@mui/material/Button";

export default function CategoryDropdown() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const categories = [
        { name: "Fashion", icon: <CheckroomOutlinedIcon fontSize="small" />, path: "/main/fashion" },
        { name: "Electronics", icon: <DevicesOutlinedIcon fontSize="small" />, path: "/main/electronics" },
        { name: "Groceries", icon: <LocalGroceryStoreOutlinedIcon fontSize="small" />, path: "/main/grocery" },
        { name: "Beauty", icon: <SpaOutlinedIcon fontSize="small" />, path: "/main/beauty" },
        { name: "Home & Living", icon: <HomeOutlinedIcon fontSize="small" />, path: "/main/dashboard" },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        setOpen(false);
    };

    return (
        <div className=" relative group z-10">  
            <Button
                onClick={() => setOpen(!open)}
             className="bg-indigo-600! relative! py-2! px-4! rounded-xl! text-white! flex! items-center! gap-2! transition-all! duration-300 shadow-md hover:bg-indigo-700 active:scale-95"

            >
                <div className="flex items-center gap-2 flex-1">
                    <MenuOutlinedIcon className="text-white text-lg" />
                    <span className="text-white font-bold text-xs tracking-wider uppercase">Explore All</span>
                </div>
                <KeyboardArrowDownOutlinedIcon className={`text-white text-lg transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />

                {/* Badge for total categories */}
                <div className="absolute -top-2 -right-1 bg-yellow-400 text-indigo-900 text-[8px] font-black rounded-full px-1.5 py-0.5 shadow-sm border border-white">
                    {categories.length}
                </div>
            </Button>

            {/* Dropdown */}
            {open && (
                <div className="absolute top-full mt-4 w-full bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-4xl overflow-hidden z-200 animate-in fade-in slide-in-from-top-4 duration-300">
                    <ul className="py-4 max-h-125 overflow-y-auto custom-scrollbar">
                        {categories.map((item, index) => (
                            <li key={index}>
                                <Button
                                    onClick={() => handleNavigate(item.path)}
                                    className="group w-full flex items-center gap-3 justify-start! px-4 py-2 transition-all rounded-none border-none text-left"
                                >
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        {cloneElement(item.icon, { sx: { fontSize: 16 } })}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-900 font-bold text-xs tracking-tight group-hover:text-indigo-600 transition-colors">
                                            {item.name}
                                        </span>
                                        <span className="text-[8px] text-gray-400 font-medium uppercase tracking-widest leading-none">
                                            Browse more
                                        </span>
                                    </div>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
