import React from "react";
import { TrashIcon, PencilIcon, PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useConfirm }  from '../../context/ConfirmationContext';
import PrimeDataTable from '../common/PrimeDataTable';
import BASE_URL from "../../api/ApiConstant";

const BannersManagement = ({
    banners = [],
    onDelete,
    onAddClick,
    onEdit,
    onSearch,
    totalRecords = 0,
    onLazy,
    lazyParams,
    onBulkDelete,
    selection = [],
    onSelectionChange,
    onSelectAll,
    searchValue,
    onReload
}) => {

    const confirm = useConfirm();

    const bulkActions = [
        {
            label: 'Archive',
            severity: 'danger',
            icon: TrashIcon,
            handler: async (selection) => {
                const confirmed = await confirm(`Archive ${selection.length} banner${selection.length > 1 ? 's' : ''}?`);
                if (confirmed) {
                    onBulkDelete(selection);
                }
            }
        }
    ];

    const positionColors = {
        homepage: "bg-blue-50 text-blue-600",
        products: "bg-orange-50 text-orange-600",
        about: "bg-cyan-50 text-cyan-600",
        category: "bg-indigo-50 text-indigo-600",
        sidebar: "bg-purple-50 text-purple-600",
        popup: "bg-rose-50 text-rose-600"
    };

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">

            {/* HEADER */}
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">
                <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                        Promotions
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Manage {totalRecords} banners
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
                            placeholder="Search banners..."
                            value={searchValue}
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
                    value={banners}
                    // loading={isLoading}
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
                    dataKey="banner_id"

                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    onSelectAll={onSelectAll}

                    showGridlines
                    bulkActions={bulkActions}

                    columns={[
                        {
                            field: "image_url",
                            header: "Banner",
                            sortable: true,
                            filter: false,
                            body: (b) => (
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-12 bg-gray-50 rounded-xl flex items-center justify-center border overflow-hidden">
                                        <img
                                            src={b.image_url ? `${BASE_URL}${b.image_url}` : "/no-image.png"}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{b.title}</span>
                                        <span className="text-[9px] text-gray-400 font-medium truncate max-w-[150px]">{b.link_url}</span>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            field: "position",
                            header: "Position",
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Position",
                            body: (b) => (
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${positionColors[b.position] || "bg-gray-100 text-gray-600"}`}>
                                    {b.position}
                                </span>
                            )
                        },
                        {
                            field: "display_order",
                            header: "Order",
                            sortable: true,
                            filter: false,
                            dataType: "numeric",
                            filterPlaceholder: "Filter Order",
                            style: { textAlign: 'center' }
                        },
                        {
                            field: "is_active",
                            header: "Status",
                            sortable: false,
                            filter: false,
                            dataType: "boolean",
                            filterPlaceholder: "Filter Status",
                            body: (b) => (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${b.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                    {b.is_active ? 'Active' : 'Draft'}
                                </span>
                            )
                        },
                        {
                            header: "Actions",
                            body: (b) => (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEdit(b)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                          const confirmed = await confirm(`Delete banner "${b.title}"?`);
                                          if (confirmed) {
                                            onDelete(b.banner_id);
                                          }
                                        }}
                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                                    >
                                        <TrashIcon className="h-4 w-4" />
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

export default BannersManagement;

