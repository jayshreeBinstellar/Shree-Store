import React, { useState } from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import MuiPagination from "../Pagination";
import Loader from "../Loader";

const SupportDesk = ({ tickets, onViewTicket, onFilterChange, loading, currentPage, totalPages, onPageChange, totalTickets, isLoading }) => {
    const [filterStatus, setFilterStatus] = useState('All');

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        onFilterChange && onFilterChange(status);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open':
                return 'bg-indigo-50 text-indigo-600';
            case 'In Progress':
                return 'bg-yellow-50 text-yellow-600';
            case 'Resolved':
                return 'bg-emerald-50 text-emerald-600';
            case 'Closed':
                return 'bg-gray-100 text-gray-500';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent':
                return 'bg-red-50 text-red-600';
            case 'High':
                return 'bg-orange-50 text-orange-600';
            case 'Normal':
                return 'bg-blue-50 text-blue-600';
            case 'Low':
                return 'bg-green-50 text-green-600';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Support Tickets</h3>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        {tickets.length} Total
                    </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                        <button
                            key={status}
                            onClick={() => handleFilterChange(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filterStatus === status
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Subject</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Priority</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-8 py-20 text-center">
                                    <Loader />
                                </td>
                            </tr>
                        ) : tickets.length > 0 ? tickets.map((ticket) => (
                            <tr key={ticket.ticket_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{ticket.full_name}</span>
                                        <span className="text-xs text-gray-400">{ticket.email}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4 font-medium text-gray-700">{ticket.subject}</td>
                                <td className="px-8 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td className="px-8 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-gray-400 text-xs">{new Date(ticket.created_at).toLocaleDateString()}</td>
                                <td className="px-8 py-4">
                                    <button
                                        onClick={() => onViewTicket(ticket)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="px-8 py-20 text-center text-gray-400 font-medium italic">No support tickets found.</td>
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
                    itemsTotal={totalTickets}
                />
            )}
        </div>
    );
};

export default SupportDesk;
