import React from "react";

const StatCard = ({ icon: Icon, label, value, colorClass, bgColorClass }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 ${bgColorClass} rounded-2xl ${colorClass}`}>
                <Icon className="h-6 w-6" />
            </div>
            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{label}</span>
        </div>
        <div className="text-2xl font-black text-gray-900">{value}</div>
    </div>
);

export default StatCard;
