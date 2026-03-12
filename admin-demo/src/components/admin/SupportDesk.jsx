import React, { useState } from "react";
import { EyeIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Loader from "../common/Loader";
import PrimeDataTable from '../common/PrimeDataTable';

const SupportDesk = ({
    tickets = [],
    onViewTicket,
    onFilterChange,
    loading,
    isLoading,
    onSearch,
    searchValue,
    totalRecords = 0,
    onLazy,
    lazyParams,
    onBulkStatusUpdate,
    onReload
}) => {
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');

    const bulkActions = [
        {
            label: 'Resolve',
            severity: 'success',
            handler: (selection) => {
                if (window.confirm(`Resolve ${selection.length} tickets?`)) {
                    onBulkStatusUpdate(selection, 'Resolved');
                    setSelectedTickets([]);
                }
            }
        },
        {
            label: 'Close',
            severity: 'danger',
            handler: (selection) => {
                if (window.confirm(`Close ${selection.length} tickets?`)) {
                    onBulkStatusUpdate(selection, 'Closed');
                    setSelectedTickets([]);
                }
            }
        },
        {
            label: 'inprogress',
            severity: 'warning',
            handler: (selection) => {
                if (window.confirm(`Set ${selection.length} tickets to In Progress?`)) {
                    onBulkStatusUpdate(selection, 'In Progress');
                    setSelectedTickets([]);
                }
            }
        },
        {
            label: 'Reopen',
            severity: 'info',
            handler: (selection) => {
                if (window.confirm(`Reopen ${selection.length} tickets?`)) {
                    onBulkStatusUpdate(selection, 'Open');
                    setSelectedTickets([]);
                }
            }
        }
    ];

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
                <div className="flex gap-4 items-center justify-between flex-wrap">
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
                    <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">

                    {/* SEARCH */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search methods..."
                            value={searchValue || ""}
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
            </div>
            <div className="overflow-x-auto p-6">
                <PrimeDataTable
                    value={tickets}
                    loading={loading}
                    rows={lazyParams?.rows || 10}
                    totalRecords={totalRecords}
                    onLazy={onLazy}
                    paginator
                    dataKey="ticket_id"
                    selection={selectedTickets}
                    onSelectionChange={setSelectedTickets}
                    filters={lazyParams?.filters}
                    filterDisplay="menu"
                    first={lazyParams?.first}
                    sortField={lazyParams?.sortField}
                    sortOrder={lazyParams?.sortOrder}
                    bulkActions={bulkActions}
                    columns={[
                        {
                            field: 'full_name',
                            header: 'User',
                            body: (row) => (
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-900">{row.full_name}</span>
                                    <span className="text-xs text-gray-400">{row.email}</span>
                                </div>
                            ),
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter User"
                        },
                        {
                            field: 'subject',
                            header: 'Subject',
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Subject"
                        },
                        {
                            field: 'priority',
                            header: 'Priority',
                            body: (row) => <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getPriorityColor(row.priority)}`}>{row.priority}</span>,
                            sortable: true,
                            filter: false,
                            filterPlaceholder: "Filter Priority"
                        },
                        {
                            field: 'status',
                            header: 'Status',
                            body: (row) => <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getStatusColor(row.status)}`}>{row.status}</span>,
                            sortable: true,
                            filter: false,
                            filterPlaceholder: "Filter Status"
                        },
                        {
                            field: 'created_at',
                            header: 'Date',
                            body: (row) => new Date(row.created_at).toLocaleDateString(),
                            sortable: true,
                            filter: false,
                            filterPlaceholder: "Filter Date"
                        },
                        {
                            header: 'Action',
                            body: (row) => (
                                <button onClick={() => onViewTicket(row)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                    <EyeIcon className="h-5 w-5" />
                                </button>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default SupportDesk;
