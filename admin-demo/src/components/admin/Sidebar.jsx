import React, { useEffect, useState, memo } from "react";
import {
    Squares2X2Icon,
    ClipboardDocumentListIcon,
    PlusIcon,
    TagIcon,
    PhotoIcon,
    TicketIcon,
    UsersIcon,
    StarIcon,
    TruckIcon,
    CreditCardIcon,
    LifebuoyIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    ShoppingBagIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import { useConfirm } from '../../context/ConfirmationContext';

import { NavLink } from "react-router-dom";
import { logout } from "../../services/AdminService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../context/settingContext";


/* ---------------- Sidebar Item ---------------- */

const SidebarItem = memo(({ to, icon: Icon, label }) => {
    return (
        <NavLink
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
                `group relative flex items-center gap-3.5 px-4 py-[14px] rounded-[14px]
                transition-all duration-200 overflow-hidden w-full
                ${isActive
                    ? "bg-indigo-50 text-indigo-600 font-bold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`
            }
        >
            {({ isActive }) => (
                <>
                    {/* Active Indicator */}
                    {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-indigo-600 rounded-r-full" />
                    )}

                    {/* Icon */}
                    <Icon
                        className={`h-[22px] w-[22px] transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-indigo-600" : "text-slate-400"
                            }`}
                        strokeWidth={isActive ? 2.5 : 2}
                    />

                    {/* Label */}
                    <span className="text-[14px] tracking-tight whitespace-nowrap">
                        {label}
                    </span>

                    {/* Glow */}
                    {isActive && (
                        <div className="absolute inset-0 bg-indigo-500/5 blur-md -z-10 rounded-2xl" />
                    )}
                </>
            )}
        </NavLink>
    );
});


/* ---------------- Menu Config ---------------- */

const MENU = [
    {
        title: "Overview",
        items: [
            { to: "/", icon: Squares2X2Icon, label: "Dashboard" },
            { to: "/orders", icon: ClipboardDocumentListIcon, label: "Orders" },
            { to: "/products", icon: PlusIcon, label: "Products" },
            { to: "/categories", icon: TagIcon, label: "Categories" },
            { to: "/customers", icon: UsersIcon, label: "Customers" }
        ]
    },
    {
        title: "Marketing",
        items: [
            { to: "/banners", icon: PhotoIcon, label: "Banners" },
            { to: "/coupons", icon: TicketIcon, label: "Coupons" },
            { to: "/reviews", icon: StarIcon, label: "Reviews" }
        ]
    },
    {
        title: "Management",
        items: [
            { to: "/shipping", icon: TruckIcon, label: "Shipping" },
            { to: "/payments", icon: CreditCardIcon, label: "Payments" },
            { to: "/support", icon: LifebuoyIcon, label: "Support" },
            { to: "/logs", icon: DocumentTextIcon, label: "Audit Logs" },
            { to: "/settings", icon: Cog6ToothIcon, label: "Settings" },
        ]
    }
];


/* ---------------- Sidebar ---------------- */

const Sidebar = () => {

    const [storeName, setStoreName] = useState("GROCERYPRO");
    const auth = useAuth();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const confirm = useConfirm();

    const handleLogout = async () => {
        const confirmed = await confirm('Are you sure you want to logout?');
        if (!confirmed) return;

        try {
            await logout();
        } catch (err) {
            console.log('Logout API optional');
        }

        auth.logout();
        navigate('/login');
    };

    // useEffect(() => {
    //     const loadSettings = async () => {
    //         try {
    //             const res = await getSettings();

    //             if (res?.status === "success" && res?.settings?.store_name) {
    //                 setStoreName(res.settings.store_name);
    //             }
    //         } catch (err) {
    //             console.error("Sidebar settings error:", err);
    //         }
    //     };

    //     loadSettings();
    // }, []);



    return (
        <aside className="w-[280px] bg-white flex flex-col h-screen sticky top-0 border-r border-slate-200 shadow-sm z-40 shrink-0">

            {/* Logo */}
            <div className="h-[88px] flex items-center gap-3 px-8">
                <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 h-[38px] w-[38px] rounded-xl flex items-center justify-center shadow-md">
                    <ShoppingBagIcon className="h-[20px] w-[20px] text-white" strokeWidth={2.5} />
                </div>

                <div className="flex flex-col">
                    <span className="text-[17px] font-black text-slate-800 uppercase">
                        {settings?.store_name}
                    </span>
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                        Admin Center
                    </span>
                </div>
            </div>


            {/* Navigation */}
            <nav className="flex flex-col gap-1 overflow-y-auto px-4 flex-1 pb-6">

                {MENU.map((section) => (
                    <div key={section.title}>

                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 mb-2 mt-6">
                            {section.title}
                        </div>

                        {section.items.map((item) => (
                            <SidebarItem key={item.to} {...item} />
                        ))}

                    </div>
                ))}

            </nav>


            <div className="p-3 mx-4 mb-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                <button
                    onClick={handleLogout}
                    className="flex gap-1 items-center w-full cursor-pointer"
                >
                    <svg
                        className="h-5 w-5 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;