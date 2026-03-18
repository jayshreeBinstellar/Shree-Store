import React from "react";
import { TrashIcon, TicketIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import PrimeDataTable from '../common/PrimeDataTable';

const CouponsManagement = ({
    coupons = [],
    onDelete,
    onAddClick,
    search = "",
    onSearch,
    totalRecords = 0,
    onLazy,
    lazyParams,
    onBulkDelete,
    selection = [],
    onSelectionChange,
    onSelectAll,
    isLoading = false,
    onReload
}) => {

    const bulkActions = [
        {
            label: 'Delete',
            severity: 'danger',
            icon: TrashIcon,
            handler: (selection) => {
                onBulkDelete(selection);
            }
        }
    ];

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">

            {/* HEADER */}
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">
                <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                        Coupons & Offers
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Manage {totalRecords} active coupons
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">

                    {/* ADD BUTTON */}
                    <button
                        onClick={onAddClick}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <TicketIcon className="h-4 w-4" />
                        Generate
                    </button>
                    {/* SEARCH */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search coupons..."
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
                    value={coupons}
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
                    dataKey="coupon_id"

                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    onSelectAll={onSelectAll}

                    showGridlines
                    bulkActions={bulkActions}

                    columns={[
                        {
                            field: 'code',
                            header: 'Code',
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Code",
                            body: cp => <span className="font-black text-indigo-600 tracking-tighter uppercase">{cp.code}</span>
                        },
                        {
                            field: 'discount_value',
                            header: 'Discount',
                            body: cp => (
                                <span className="font-bold text-gray-900">
                                    {(cp.type || cp.discount_type || '').includes('percent') ? `${cp.value || cp.discount_value}%` : `$${cp.value || cp.discount_value}`}
                                </span>
                            ),
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Discount"
                        },
                        {
                            field: 'min_order_value',
                            header: 'Min. Order',
                            body: cp => <span className="text-gray-600 font-medium">${cp.min_cart_value || cp.min_order_value || 0}</span>,
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Min Order"
                        },
                        {
                            field: 'usage',
                            header: 'Usage',
                            body: cp => (
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-700 uppercase">{cp.used_count || 0} / {cp.usage_limit || 0}</span>
                                        <span className="text-[9px] text-gray-400 font-bold">{Math.round((cp.used_count || 0) / (cp.usage_limit || 1) * 100)}%</span>
                                    </div>
                                    <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="bg-indigo-600 h-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, (cp.used_count || 0) / (cp.usage_limit || 1) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ),
                            sortable: false
                        },
                        {
                            field: 'expiry_date',
                            header: 'Expiry',
                            body: cp => cp.expiry_date ? (
                                <span className={`font-bold ${new Date(cp.expiry_date) < new Date() ? 'text-rose-500' : 'text-gray-600'}`}>
                                    {new Date(cp.expiry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            ) : 'No Limit',
                            sortable: true,
                            filter: false,
                            filterPlaceholder: "Filter Expiry"
                        },
                        {
                            header: 'Actions',
                            body: cp => (
                                <button
                                    onClick={() => onDelete(cp.coupon_id)}
                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Delete Coupon"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            )
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default CouponsManagement;
