import React from "react";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import MuiPagination from "../Pagination";

const CustomersManagement = ({ 
    customers, 
    onToggleBlock, 
    onUpdateRole,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    isLoading = false,
    totalCustomers = 0
}) => {
    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">User Directory</h3>
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest">{totalCustomers} Accounts</span>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {customers.map((user) => (
                            <tr key={user.user_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{user.full_name}</span>
                                        <span className="text-xs text-gray-400">{user.email}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => onUpdateRole(user.user_id, e.target.value)}
                                        className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Customer">Customer</option>
                                        <option value="Staff">Staff</option>
                                        <option value="Super Admin">Super Admin</option>
                                    </select>
                                </td>
                                <td className="px-8 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.is_blocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {user.is_blocked ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onToggleBlock(user.user_id)}
                                            className={`p-2 rounded-lg transition-colors ${user.is_blocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'}`}
                                            title={user.is_blocked ? "Unblock User" : "Block User"}
                                        >
                                            {user.is_blocked ? <LockOpenIcon className="h-5 w-5" /> : <LockClosedIcon className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-8 py-12 text-center text-gray-400 font-medium">No customers found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <MuiPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    isLoading={isLoading}
                    itemsTotal={totalCustomers}
                />
            )}
        </div>
    );
};

export default CustomersManagement;
