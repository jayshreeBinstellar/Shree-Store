import React from "react";
import { ClockIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import PrimeDataTable from '../common/PrimeDataTable';

const ActivityLogs = ({
    logs = [],
    onSearch,
    totalRecords = 0,
    onLazy,
    lazyParams,
    search = "",
    isLoading = false,
    onReload
}) => {

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">

            {/* HEADER */}
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">
                <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        System Audit Trail
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Monitoring {totalRecords} administrative actions
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">
                    {/* SEARCH */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={search || ""}
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-56 lg:w-64"
                        />
                        <svg className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                     <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        onClick={() => onReload && onReload()}
                    ><ArrowPathIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto flex-1 p-4">
                <PrimeDataTable
                    value={logs}
                    loading={isLoading}
                    rows={lazyParams?.rows || 10}
                    totalRecords={totalRecords}
                    first={lazyParams?.first || 0}
                    sortField={lazyParams?.sortField}
                    sortOrder={lazyParams?.sortOrder}
                    filters={lazyParams?.filters}
                    filterDisplay="menu"
                    paginator
                    lazy
                    onLazy={onLazy}
                    dataKey="log_id"

                    showGridlines

                    columns={[
                        {
                            field: 'admin_name',
                            header: 'Administrator',
                            body: log => (
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase">
                                        {log.admin_name?.substring(0, 2)}
                                    </div>
                                    <span className="font-bold text-gray-900">{log.admin_name}</span>
                                </div>
                            ),
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Admin"
                        },
                        {
                            field: 'action',
                            header: 'Action Performed',
                            body: log => (
                                <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                    {log.action}
                                </span>
                            ),
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Action"
                        },
                        {
                            field: 'ip_address',
                            header: 'IP Source',
                            body: log => <span className="font-mono text-[11px] text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{log.ip_address}</span>,
                            sortable: true,
                            filter: false,
                            filterPlaceholder: "Filter IP"
                        },
                        {
                            field: 'created_at',
                            header: 'Event Timestamp',
                            body: log => (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <ClockIcon className="h-3.5 w-3.5" />
                                    <span className="text-[11px] font-bold">{formatDate(log.created_at)}</span>
                                </div>
                            ),
                            sortable: true,
                            filter: false,
                            filterPlaceholder: "Filter Time"
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default ActivityLogs;




