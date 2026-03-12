import React from "react";

const StatCard = ({ icon: Icon, label, value, colorClass, bgColorClass }) => (
    <div className="group relative bg-white p-6 rounded-[2rem] border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        {/* Decorative background element */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bgColorClass} opacity-50 blur-2xl group-hover:scale-150 group-hover:opacity-70 transition-all duration-500`}></div>

        <div className="flex items-center gap-4 mb-5 relative z-10">
            <div className={`p-4 ${bgColorClass} rounded-[1.25rem] ${colorClass} shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                <Icon className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <span className="text-slate-500 font-extrabold uppercase text-[11px] tracking-widest leading-tight">{label}</span>
        </div>
        <div className="text-[2.2rem] font-black text-slate-800 tracking-tighter relative z-10 mb-1">{value}</div>
    </div>
);

export default StatCard;
