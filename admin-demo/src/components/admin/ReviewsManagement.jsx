import React from "react";
import { StarIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useConfirm }  from '../../context/ConfirmationContext';
import PrimeDataTable from '../common/PrimeDataTable';

const ReviewsManagement = ({
    reviews = [],
    onUpdateStatus,
    search = "",
    onSearch,
    totalRecords = 0,
    onLazy,
    lazyParams,
    onBulkStatusUpdate,
    selection = [],
    onSelectionChange,
    onSelectAll,
    isLoading = false,
    onReload
}) => {

    const confirm = useConfirm();

    const bulkActions = [
        {
            label: 'Approve',
            severity: 'success',
            icon: CheckCircleIcon,
            handler: async (selection) => {
                const confirmed = await confirm(`Approve ${selection.length} review${selection.length > 1 ? 's' : ''}?`);
                if (confirmed) {
                    onBulkStatusUpdate(selection, 'Approved');
                }
            }
        },
        {
            label: 'Reject',
            severity: 'danger',
            icon: XCircleIcon,
            handler: async (selection) => {
                const confirmed = await confirm(`Reject ${selection.length} review${selection.length > 1 ? 's' : ''}?`);
                if (confirmed) {
                    onBulkStatusUpdate(selection, 'Rejected');
                }
            }
        }
    ];

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">

            {/* HEADER */}
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">
                <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                        Customer Feedback
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Manage {totalRecords} reviews
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">
                    {/* SEARCH */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search reviews..."
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
                    value={reviews}
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
                    dataKey="review_id"
                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    onSelectAll={onSelectAll}
                    showGridlines
                    bulkActions={bulkActions}
                    columns={[
                        {
                            field: 'product_title',
                            header: 'Product',
                            body: rev => (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center p-1 border overflow-hidden">
                                        <img src={rev.product_image} alt="" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{rev.product_title}</span>
                                        <span className="text-[9px] text-gray-400 font-medium">Product ID: {rev.product_id}</span>
                                    </div>
                                </div>
                            ),
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Product"
                        },
                        {
                            field: 'full_name',
                            header: 'Customer',
                            body: rev => <span className="font-bold text-gray-900">{rev.full_name}</span>,
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Name"
                        },
                        {
                            field: 'rating',
                            header: 'Rating',
                            body: rev => (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 rounded-lg w-fit">
                                    <StarIcon className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                                    <span className="text-xs font-black text-yellow-700">{rev.rating}</span>
                                </div>
                            ),
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Rating"
                        },
                        {
                            field: 'comment',
                            header: 'Feedback',
                            body: rev => <p className="text-xs text-gray-500 font-medium line-clamp-2 max-w-xs italic">"{rev.comment}"</p>,
                            sortable: false,
                            filter: false,
                            filterPlaceholder: "Filter Comment"
                        },
                        {
                            field: 'status',
                            header: 'Status',
                            body: rev => (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${rev.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                    rev.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                                        'bg-amber-50 text-amber-600'
                                    }`}>
                                    {rev.status}
                                </span>
                            ),
                            sortable: false,
                            filter: false,
                            filterPlaceholder: "Filter Status"
                        },
                        {
                            header: 'Actions',
                            body: rev => (
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                          const confirmed = await confirm(`Approve review for "${rev.product_title}"?`);
                                          if (confirmed) {
                                            onUpdateStatus(rev.review_id, 'Approved');
                                          }
                                        }}
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        title="Approve"
                                        disabled={rev.status === 'Approved'}
                                    >
                                        <CheckCircleIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                          const confirmed = await confirm(`Reject review for "${rev.product_title}"?`);
                                          if (confirmed) {
                                            onUpdateStatus(rev.review_id, 'Rejected');
                                          }
                                        }}
                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Reject"
                                        disabled={rev.status === 'Rejected'}
                                    >
                                        <XCircleIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default ReviewsManagement;
