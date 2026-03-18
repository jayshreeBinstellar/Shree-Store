import React, { useState } from "react";
import { EyeIcon, PrinterIcon, ArrowPathIcon, TruckIcon, CheckIcon} from "@heroicons/react/24/outline";
import { useConfirm }  from '../../context/ConfirmationContext';
import PrimeDataTable from '../common/PrimeDataTable';
import { Calendar } from "primereact/calendar";


const dateFilterTemplate = (options) => {
    return (
        <Calendar
            value={options.value}
            onChange={(e) => options.filterCallback(e.value)}
            dateFormat="mm-dd-yy"
            placeholder="Select Date"
            showIcon
            className="w-full"
        />
    );
};



const OrdersManagement = ({
    orders = [],
    onUpdateStatus,
    onViewInvoice,
    onEditShipping,
    isLoading = false,
    onLazy,
    totalRecords = 0,
    onSearch,
    onReload,
    lazyParams = {},
    selection = [],
    onSelectionChange,
    onBulkStatusUpdate,
    onSelectAll,
    searchValue
}) => {
    // const [selectedOrders, setSelectedOrders] = useState([]);

    // Extract sortField and sortOrder from lazyParams
    // const { sortField, sortOrder, filters } = lazyParams;

    // const handleSelectionChange = (e) => {
    //     if (onSelectionChange) {
    //         onSelectionChange(e.value);
    //     }
    // };
    const confirm = useConfirm();

    const bulkActions = [
        {
            label: "Pending",
            icon: CheckIcon,
            handler: async (selection) => {
                const confirmed = await confirm(`Set ${selection.length} order${selection.length > 1 ? 's' : ''} to Pending?`);
                if (confirmed && onBulkStatusUpdate) {
                    onBulkStatusUpdate(selection, "Pending");
                }
            }
        },
        {
            label: "Shipped",
            icon: TruckIcon,
            handler: async (selection) => {
                const confirmed = await confirm(`Set ${selection.length} order${selection.length > 1 ? 's' : ''} to Shipped?`);
                if (confirmed && onBulkStatusUpdate) {
                    onBulkStatusUpdate(selection, "Shipped");
                }
            }
        },
        {
            label: "Delivered",
            icon: CheckIcon,
            severity: "success",
            handler: async (selection) => {
                const confirmed = await confirm(`Mark ${selection.length} order${selection.length > 1 ? 's' : ''} as Delivered?`);
                if (confirmed && onBulkStatusUpdate) {
                    onBulkStatusUpdate(selection, "Delivered");
                }
            }
        },
        {
            label: "Cancelled",
            icon: CheckIcon,
            severity: "danger",
            handler: async (selection) => {
                const confirmed = await confirm(`Cancel ${selection.length} order${selection.length > 1 ? 's' : ''}?`);
                if (confirmed && onBulkStatusUpdate) {
                    onBulkStatusUpdate(selection, "Cancelled");
                }
            }
        }
    ];

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Recent Orders</h3>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchValue}
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-64"
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
            <div className="overflow-x-auto flex-1 p-4">
                <PrimeDataTable
                    value={orders}
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
                    dataKey="order_id"
                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    onSelectAll={onSelectAll}
                    bulkActions={bulkActions}
                    columns={[
                        { field: 'order_id', header: 'Order ID', body: (row) => `#${row.order_id}`, sortable: true, filter: true, filterPlaceholder: "Filter ID" },
                        {
                            field: 'full_name',
                            header: 'Customer',
                            body: (row) => <span className="font-bold text-gray-900">{row.full_name}</span>,
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Customer"
                        },
                        {
                            field: 'created_at',
                            header: 'Date',
                            body: (row) => (
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    {new Date(row.created_at).toLocaleDateString()}
                                </span>
                            ),
                            sortable: true,
                            filter: true,
                            dataType: "date",
                            filterMatchMode: "date is",
                            filterElement: dateFilterTemplate
                        },


                        { 
                            field: 'total_amount', 
                            header: 'Total', 
                            body: (row) => `$${Number(row.total_amount).toFixed(2)}`, 
                            sortable: true, 
                            filter: true, 
                            filterPlaceholder: "Filter Total",
                            dataType: "numeric",
                            filterMatchMode: "equals"
                        },
                        {
                            field: 'status',
                            header: 'Status',
                            body: (row) => (
                                    <select
                                    value={row.status}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value;
                                      const confirmed = newStatus === 'Cancelled' ? await confirm(`Cancel order #${row.order_id}?`) : true;
                                      if (confirmed) {
                                        onUpdateStatus(row.order_id, newStatus);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase outline-none border-2 transition-all ${row.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        row.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                                        }`}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            ),
                            sortable: true,
                            filter: false,
                            filterPlaceholder: "Filter Status"
                        },
                        {
                            header: 'Actions',
                            body: (row) => (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEditShipping(row)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        title="Shipping Details"
                                    >
                                        <TruckIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => onViewInvoice(row)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        title="View Invoice"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Print Selection">
                                        <PrinterIcon className="h-5 w-5" />
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

export default OrdersManagement;
