import React, { useEffect, useState } from "react";
import {
    Squares2X2Icon, ClipboardDocumentListIcon, PlusIcon, TagIcon,
    PhotoIcon, TicketIcon, UsersIcon, StarIcon, TruckIcon,
    CreditCardIcon, LifebuoyIcon, DocumentTextIcon, Cog6ToothIcon,
    ShoppingBagIcon
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import { getSettings } from "../../services/AdminService";

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
            : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
        end={to === "/"}
    >
        {({ isActive }) => (
            <>
                <Icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} />
                <span className={`font-bold text-sm tracking-tight ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{label}</span>
            </>
        )}
    </NavLink>
);

const Sidebar = () => {
    const [storeName, setStoreName] = useState('GROCERYPRO');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await getSettings();
                if (res.status === 'success' && res.settings && res.settings.store_name) {
                    setStoreName(res.settings.store_name);
                }
            } catch (error) {
                console.error("Failed to load settings in sidebar", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <aside className="w-80 bg-white border-r border-gray-100 flex flex-col p-8 sticky top-0 h-screen">
            <div className="flex items-center gap-3 mb-12 px-2">
                <div className="bg-indigo-600 h-10 w-10 rounded-xl flex items-center justify-center">
                    <ShoppingBagIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black text-gray-900 hidden lg:block tracking-tighter uppercase">
                    {storeName}
                </span>
            </div>

            <nav className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                <SidebarItem to="/" icon={Squares2X2Icon} label="Dashboard" />
                <SidebarItem to="/orders" icon={ClipboardDocumentListIcon} label="Orders" />
                <SidebarItem to="/products" icon={PlusIcon} label="Products" />
                <SidebarItem to="/categories" icon={TagIcon} label="Categories" />
                <SidebarItem to="/banners" icon={PhotoIcon} label="Banners" />
                <SidebarItem to="/coupons" icon={TicketIcon} label="Coupons" />
                <SidebarItem to="/customers" icon={UsersIcon} label="Customers" />
                <SidebarItem to="/reviews" icon={StarIcon} label="Reviews" />
                <SidebarItem to="/shipping" icon={TruckIcon} label="Shipping" />
                <SidebarItem to="/payments" icon={CreditCardIcon} label="Payments" />
                <SidebarItem to="/support" icon={LifebuoyIcon} label="Support" />
                <SidebarItem to="/logs" icon={DocumentTextIcon} label="Audit Logs" />
                <SidebarItem to="/settings" icon={Cog6ToothIcon} label="Settings" />
            </nav>

            <div className="mt-auto bg-gray-50 rounded-3xl p-4 hidden lg:block border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Build Status</p>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-gray-700">v2.1 Stable</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

