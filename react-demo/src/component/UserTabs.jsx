import React from 'react';

const UserTabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 flex gap-2">
            {["orders", "wishlist", "addresses"].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                    {tab === "orders" ? "My Orders" : tab === "wishlist" ? "Wishlist" : "Addresses"}
                </button>
            ))}
        </div>
    );
};

export default UserTabs;
