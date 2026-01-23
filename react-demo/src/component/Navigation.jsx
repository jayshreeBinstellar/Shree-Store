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


import Categories from "./Categories";

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
        <nav className="header py-4 border-b">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-12 items-center gap-4">

                    {/* Categories */}
                    <div className="col-span-6 lg:col-span-2">
                        <Categories />
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex col-span-10 justify-end">
                        <ul className="flex items-center gap-6 text-[16px] uppercase">
                            {menuItems.map((item) => (
                                <li key={item.name}>
                                    <NavLink
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `menu-link flex items-center gap-2 px-3 py-2 rounded-md transition
                                            ${isActive
                                            ? "bg-indigo-700 text-white!"
                                            : "text-gray-700 hover:bg-indigo-700"}`
                                        }
                                    >
                                        <item.icon
                                            className={({ isActive }) =>
                                                isActive ? "text-white" : "text-indigo-600"
                                            }
                                        />
                                        <span>{item.name}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex justify-end col-span-6 lg:hidden">
                        <button
                            onClick={() => setOpen(!open)}
                            className="p-2 rounded-md border"
                        >
                            {open ? <CloseOutlinedIcon /> : <MenuOutlinedIcon />}
                        </button>
                    </div>

                </div>

                {/* Mobile Menu */}
                <div
                    className={`lg:hidden transition-all duration-300 overflow-hidden ${open ? "max-h-125 mt-4" : "max-h-0"
                        }`}
                >
                    <ul className="flex flex-col gap-3 bg-white border rounded-lg p-4 shadow">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.to}
                                    onClick={() => setOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 py-2 px-3 rounded-md text-sm uppercase transition
           ${isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 hover:bg-gray-100"}`
                                    }
                                >
                                    <item.icon
                                        className={({ isActive }) =>
                                            isActive ? "text-white" : "text-gray-600"
                                        }
                                    />
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
