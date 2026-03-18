
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { BellIcon, MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Layout = () => {
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname.substring(1) || 'dashboard'; // remove leading slash
        if (path === 'dashboard' || path === '') return 'Command Center';

        return path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                {/* Header Navbar */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 transition-all">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-black tracking-tight text-slate-800">
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* <div className="relative hidden md:block group focus-within:w-72 transition-all duration-300 w-64">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 hover:bg-slate-100 border border-transparent rounded-2xl text-sm focus:bg-white focus:outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 font-semibold"
                            />
                        </div> */}
                        <button className="relative p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
                            <BellIcon className="h-6 w-6" strokeWidth={2} />
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse"></span>
                        </button>
                        <Link
                        to={'/profile'}
                        
                        className="flex items-center gap-3 hover:bg-slate-100 rounded-full hover:text-slate-600 transition-opacity">
                                    <UserCircleIcon className="h-8 w-8 text-slate-600" />
                        </Link>
                    </div>
                </header>

                <div className="p-6 md:p-8 lg:p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
