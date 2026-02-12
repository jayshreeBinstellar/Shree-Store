import React, { useState, useMemo } from "react";
import MuiPagination from "../Pagination";

const ActivityLogs = ({ logs, total, currentPage, limit, totalPages, onPageChange, itemsPerPage, itemsTotal }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
    const [filterAction, setFilterAction] = useState("");

    // Get unique actions for filter dropdown
    const uniqueActions = useMemo(() => {
        return [...new Set(logs.map(log => log.action))];
    }, [logs]);

    // Filter and sort logs
    const filteredAndSortedLogs = useMemo(() => {
        let filtered = logs.filter(log => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                log.admin_name?.toLowerCase().includes(searchLower) ||
                log.action?.toLowerCase().includes(searchLower) ||
                log.ip_address?.toLowerCase().includes(searchLower);

            const matchesAction = !filterAction || log.action === filterAction;

            return matchesSearch && matchesAction;
        });

        // Sort
        return filtered.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [logs, searchTerm, sortConfig, filterAction]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return "↕";
        return sortConfig.direction === "asc" ? "↑" : "↓";
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Audit Activity Logs</h3>

                    {/* Filter and Search Section */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        {/* Search - Left */}
                        <input
                            type="text"
                            placeholder="Search by admin, action, or IP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        {/* Action Filter - Right */}
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="w-full md:w-60 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Actions</option>
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>

                    </div>

                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th
                                onClick={() => handleSort("admin_name")}
                                className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-600 transition-colors"
                            >
                                Admin {getSortIcon("admin_name")}
                            </th>
                            <th
                                onClick={() => handleSort("action")}
                                className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-600 transition-colors"
                            >
                                Action {getSortIcon("action")}
                            </th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">IP Address</th>
                            <th
                                onClick={() => handleSort("created_at")}
                                className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-600 transition-colors"
                            >
                                Timestamp {getSortIcon("created_at")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredAndSortedLogs.length > 0 ? filteredAndSortedLogs.map((log) => (
                            <tr key={log.log_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4 font-bold text-gray-900">{log.admin_name || "Unknown"}</td>
                                <td className="px-8 py-4">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-gray-500 text-sm font-mono">{log.ip_address || "N/A"}</td>
                                <td className="px-8 py-4 text-gray-600 text-sm">{formatDate(log.created_at)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-medium italic">
                                    {searchTerm || filterAction ? "No matching logs found." : "No activity logs found yet."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <MuiPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    itemsPerPage={itemsPerPage}
                    itemsTotal={itemsTotal}
                />
            )}
        </div>
    );
};

export default ActivityLogs;




