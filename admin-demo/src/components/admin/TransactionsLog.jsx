import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import PrimeDataTable from '../common/PrimeDataTable';

const TransactionsLog = ({
    transactions = [],
    onSearch,
    totalRecords = 0,
    onLazy,
    lazyParams,
    search = "",
    onBulkStatusUpdate,
    selection = [],
    onSelectionChange,
    onSelectAll,
    isLoading = false,
    onReload
}) => {

    const bulkActions = [
        {
            label: 'Refund',
            severity: 'warning',
            icon: ArrowPathIcon,
            handler: (selection) => {
                onBulkStatusUpdate(selection, 'Refunded');
            }
        }
    ];

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
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                        Financial ledger
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Reviewing {totalRecords} secure transactions
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">
                    {/* SEARCH */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search payments..."
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
                    value={transactions}
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
                    dataKey="payment_id"

                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    onSelectAll={onSelectAll}

                    showGridlines
                    bulkActions={bulkActions}

                    columns={[
                        {
                            field: 'payment_id',
                            header: 'Transaction ID',
                            body: tx => (
                                <div className="flex flex-col">
                                    <span className="font-mono text-[16px] font-black text-gray-600 tracking-tighter uppercase">
                                        {tx.payment_id?.substring(0, 18)}...
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-medium">Verified Capture</span>
                                </div>
                            ),
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Search by ID"
                        },
                        {
                            field: 'order_id',
                            header: 'Order Reference',
                            body: tx => <span className="font-bold text-gray-900">#{tx.order_id}</span>,
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Search by Order"
                        },
                        {
                            field: 'total_amount',
                            header: 'Amount',
                            body: tx => (
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-black text-gray-900">${Number(tx.total_amount).toFixed(2)}</span>
                                    <span className="text-[9px] text-emerald-500 font-bold uppercase">Success</span>
                                </div>
                            ),
                            sortable: true,
                            filter: false,
                            filterPlaceholder: "Search by Amount"
                        },
                        {
                            field: 'status',
                            header: 'Status',
                            body: tx => (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${tx.status === 'Delivered' || tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                    {tx.status}
                                </span>
                            ),
                            sortable: true,
                            filter: false,
                            filterPlaceholder: "Search by Status"
                        },
                        {
                            field: 'payment_method',
                            header: 'Settlement Gateway',
                            body: tx => (
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-gray-600">{tx.payment_method || 'Stripe'}</span>
                                </div>
                            ),
                            sortable: false,
                            filter: false,
                            filterPlaceholder: "Search by Gateway"
                        },
                        {
                            field: 'created_at',
                            header: 'Processed Date',
                            body: tx => <span className="text-[11px] font-bold text-gray-400">{formatDate(tx.created_at)}</span>,
                            sortable: false,
                            filter: false,
                            filterPlaceholder: "Search by Timestamp"
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default TransactionsLog;
