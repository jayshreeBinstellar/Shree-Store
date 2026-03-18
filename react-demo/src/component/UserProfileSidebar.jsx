import React from 'react';
import { UserIcon, ClockIcon, MapPinIcon, ShieldCheckIcon, ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

const UserProfileSidebar = ({ user, handleLogout }) => {
    return (
        <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-50 shadow-xl bg-gray-50 flex items-center justify-center">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl font-black text-indigo-200">{user.full_name?.charAt(0)}</span>
                    )}
                </div>
                <div className="absolute bottom-0 right-1 bg-indigo-600 text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-all border-4 border-white active:scale-95">
                    <UserIcon className="w-4 h-4" />
                </div>
            </div>

            <h2 className="mt-6 text-2xl font-black text-gray-900 tracking-tight">{user.full_name}</h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">{user.email}</p>

            <div className="w-full h-px bg-linear-to-r from-transparent via-gray-100 to-transparent my-8"></div>

            <div className="w-full space-y-5">
                <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                        <ClockIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Member Since</p>
                        <p className="text-sm font-black text-gray-800">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                        <MapPinIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gender</p>
                        <p className="text-sm font-black text-gray-800">{user.gender || "Not Specified"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
                        <p className="text-sm font-black text-blue-600 italic">Premium Member</p>
                    </div>
                </div>
            </div>

            <button onClick={handleLogout} className="mt-10 w-full py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200 group">
                <ArrowLeftStartOnRectangleIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Logout
            </button>
        </div>
    );
};

export default UserProfileSidebar;
