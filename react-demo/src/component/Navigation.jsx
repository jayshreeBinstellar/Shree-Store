import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import LocalGroceryStoreOutlinedIcon from "@mui/icons-material/LocalGroceryStoreOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";


// import Categories from "./Categories";

const Navigation = () => {
    const [open, setOpen] = useState(false);

    const menuItems = [
        { name: "Home", to: "/main/dashboard", icon: HomeOutlinedIcon },
        { name: "Fashion", to: "/main/fashion", icon: CheckroomOutlinedIcon },
        { name: "Electronics", to: "/main/electronics", icon: DevicesOutlinedIcon },
        { name: "Bags", to: "/main/bag", icon: BakeryDiningOutlinedIcon },
        { name: "Footwear", to: "/main/footwear", icon: LocalGroceryStoreOutlinedIcon },
        { name: "Groceries", to: "/main/grocery", icon: LocalGroceryStoreOutlinedIcon },
        { name: "Beauty", to: "/main/beauty", icon: ArticleOutlinedIcon },
        { name: "Shop", to: "/main/products", icon: LocalMallOutlinedIcon },
        { name: "Contact", to: "/main/contact", icon: ContactMailOutlinedIcon },
    ];

    return (
        <nav className="header py-4 border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 xl:px-12">

                <div className="flex items-center justify-between lg:justify-center">

                    {/* Mobile Button */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setOpen(!open)}
                            className="p-2 rounded-md border hover:bg-gray-100 transition"
                        >
                            {open ? <CloseOutlinedIcon /> : <MenuOutlinedIcon />}
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <ul className="hidden lg:flex items-center 
                     gap-2 lg:gap-4
                     text-[14px] lg:text-[15px] xl:text-[16px]
                     font-medium uppercase">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 lg:px-4 py-2 rounded-md transition-all duration-200
                ${isActive
                                            ? "bg-indigo-700 text-white"
                                            : "text-gray-700 hover:bg-indigo-600 hover:text-white"}`
                                    }
                                >
                                    <item.icon className="text-lg" />
                                    <span>{item.name}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    {/* Spacer for symmetry */}
                    <div className="hidden lg:block w-8"></div>
                </div>

                {/* Mobile Dropdown */}
                <div
                    className={`lg:hidden transition-all duration-300 overflow-hidden ${open ? "max-h-96 mt-4" : "max-h-0"
                        }`}
                >
                    <ul className="flex flex-col gap-3 bg-white border rounded-lg p-4 shadow-md">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.to}
                                    onClick={() => setOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 py-2 px-3 rounded-md text-sm uppercase transition
                ${isActive
                                            ? "bg-indigo-600 text-white"
                                            : "text-gray-700 hover:bg-gray-100"}`
                                    }
                                >
                                    <item.icon />
                                    {item.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </nav>




    );
};

export default Navigation;
