import React, { useState } from "react";
import { PlusIcon, PencilIcon, ArchiveBoxIcon, CheckIcon, NoSymbolIcon, TrashIcon, ArrowPathIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { useConfirm }  from '../../context/ConfirmationContext';
import PrimeDataTable from "../common/PrimeDataTable";
import BASE_URL from "../../api/ApiConstant";
import SearchIcon from '@mui/icons-material/Search';

const ProductsManagement = ({
    products = [],
    onEdit,
    onToggleStatus,
    onDelete,
    onAddClick,
    isLoading = false,
    search = "",
    onSearch,
    totalRecords = 0,
    onLazy,
    lazyParams,
    onBulkDelete,
    onBulkStatusUpdate,
    onSelectAll,
    selection,
    onSelectionChange,
    onBulkUpload,
    onReload
}) => {


    const confirm = useConfirm();

    const bulkActions = [
        {
            label: "Activate",
            icon: CheckIcon,
            handler: async (selection) => {
                const confirmed = await confirm(`Activate ${selection.length} product${selection.length > 1 ? 's' : ''}?`);
                if (confirmed) {
                    onBulkStatusUpdate(selection, true);
                }
            }
        },
        {
            label: "Draft",
            icon: NoSymbolIcon,
            handler: async (selection) => {
                const confirmed = await confirm(`Set ${selection.length} product${selection.length > 1 ? 's' : ''} to Draft?`);
                if (confirmed) {
                    onBulkStatusUpdate(selection, false);
                }
            }
        },
        {
            label: "Archive",
            icon: TrashIcon,
            severity: "danger",
            handler: async (selection) => {
                const confirmed = await confirm(`Archive ${selection.length} product${selection.length > 1 ? 's' : ''}? This cannot be undone.`);
                if (confirmed) {
                    onBulkDelete(selection);
                }
            }
        },
        {
            label: "Bulk Upload",
            icon: CloudArrowUpIcon,
            handler: () => onBulkUpload?.()
        }
    ];

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">

            {/* HEADER */}
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">

                <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                        Inventory Control
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Manage {totalRecords} products
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">

                    {/* ADD BUTTON */}
                    <button
                        onClick={onAddClick}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add
                    </button>


                    {/* SEARCH */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search || ""}
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-56 lg:w-64"
                        />
                        <SearchIcon className="w-3 h-3 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>

                    {/* RESET BUTTON */}
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        onClick={() => onReload && onReload()}
                    ><ArrowPathIcon className="h-5 w-5" />

                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto flex-1 p-4">

                <PrimeDataTable
                    value={products}
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
                    dataKey="product_id"
                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    bulkActions={bulkActions}
                    onSelectAll={onSelectAll}
                    columns={[
                        {
                            field: "title",
                            header: "Product",
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Product",
                            body: (p) => (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border p-1">
                                        <img
                                            src={
                                                p.thumbnail
                                                    ? p.thumbnail.startsWith("http")
                                                        ? p.thumbnail
                                                        : `${BASE_URL}${p.thumbnail}`
                                                    : "/no-image.png"
                                            }
                                            alt=""
                                            className="max-w-full max-h-full object-cover"
                                        />
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        {p.title}
                                    </div>
                                </div>
                            ),
                        },
                        {
                            field: "category",
                            header: "Category",
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Category",
                        },
                        {
                            field: "price",
                            header: "Price",
                            sortable: true,
                            filter: true,
                            dataType: "numeric",
                            filterPlaceholder: "Filter Price",
                            body: (p) => `$${Number(p.price).toFixed(2)}`,
                            style: { textAlign: "center" }
                        },
                        {
                            field: "stock",
                            header: "Stock",
                            sortable: true,
                            filter: true,
                            dataType: "numeric",
                            filterPlaceholder: "Filter Stock",
                            style: { textAlign: "center" }
                        },
                        {
                            field: "is_active",
                            header: "Status",
                            sortable: true,
                            filter: true,
                            dataType: "boolean",
                            filterPlaceholder: "Filter Status",
                            body: (p) => (
                                <button
                                    onClick={async () => {
                                      const confirmed = await confirm(p.is_active ? `Deactivate "${p.title}"?` : `Activate "${p.title}"?`);
                                      if (confirmed) {
                                        onToggleStatus(p.product_id, !p.is_active);
                                      }
                                    }}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.is_active
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-yellow-50 text-yellow-600"
                                        }`}
                                >
                                    {p.is_active ? "Active" : "Draft"}
                                </button>
                            ),
                        },
                        {
                            header: "Actions",
                            body: (p) => (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEdit(p)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                          const confirmed = await confirm(`Archive product "${p.title}"? This cannot be undone.`);
                                          if (confirmed) {
                                            onDelete(p.product_id);
                                          }
                                        }}
                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                                    >
                                        <ArchiveBoxIcon className="h-4 w-4" />
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

export default ProductsManagement;