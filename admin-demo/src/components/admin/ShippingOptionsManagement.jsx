import React from 'react';
import { PencilSquareIcon, TrashIcon, TruckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import PrimeDataTable from '../common/PrimeDataTable';

const ShippingOptionsManagement = ({
    options = [],
    onEditClick,
    onAddClick,
    onDelete,
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
                        Shipping Logistics
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Manage {options.length} delivery methods
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">

                       {/* ADD BUTTON */}
                    <button
                        onClick={onAddClick}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <TruckIcon className="h-4 w-4" />
                        Add Method
                    </button>
                    {/* SEARCH */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search methods..."
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
                    value={options}
                    loading={isLoading}
                    rows={lazyParams?.rows || 10}
                    totalRecords={totalRecords || options.length}
                    first={lazyParams?.first || 0}
                    sortField={lazyParams?.sortField}
                    sortOrder={lazyParams?.sortOrder}
                    filters={lazyParams?.filters}
                    filterDisplay="menu"
                    paginator
                    lazy={!!onLazy}
                    onLazy={onLazy}
                    dataKey="shipping_id"

                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    onSelectAll={onSelectAll}

                    showGridlines
                    bulkActions={bulkActions}

                    columns={[
                        {
                            field: 'name',
                            header: 'Method Name',
                            body: row => <span className="font-bold text-gray-900">{row.name}</span>,
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Name"
                        },
                        {
                            field: 'cost',
                            header: 'Shipping Cost',
                            body: (row) => <span className="font-black text-indigo-600 tracking-tighter">${parseFloat(row.cost).toFixed(2)}</span>,
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Cost"
                        },
                        {
                            field: 'estimated_days',
                            header: 'Delivery Time',
                            body: row => <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase tracking-tight">{row.estimated_days}</span>,
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Days"
                        },
                        {
                            header: 'Actions',
                            body: (row) => (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEditClick(row)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Edit Method"
                                    >
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(row.shipping_id)}
                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Delete Method"
                                    >
                                        <TrashIcon className="h-5 w-5" />
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

export default ShippingOptionsManagement;
