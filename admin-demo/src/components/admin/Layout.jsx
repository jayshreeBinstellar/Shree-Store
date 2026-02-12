
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname.substring(1) || 'dashboard'; // remove leading slash
        if (path === 'dashboard' || path === '') return 'Command Center';

        // Capitalize info
        // Simple logic for now
        return path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 lg:p-10 max-w-8xl mx-auto">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                        </div>
                    </div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
