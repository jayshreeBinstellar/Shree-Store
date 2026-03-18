import React from "react";
import { LockClosedIcon, LockOpenIcon, UserPlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useConfirm }  from '../../context/ConfirmationContext';
import PrimeDataTable from '../common/PrimeDataTable';
import SearchIcon from '@mui/icons-material/Search';

const CustomersManagement = ({
    customers = [],
    onToggleBlock,
    onUpdateRole,
    onAddCustomer,
    isLoading = false,
    searchValue,
    onSearch,
    totalRecords = 0,
    onLazy,
    lazyParams,
    onBulkBlock,
    selection = [],
    onSelectionChange,
    onSelectAll,
    onReload
}) => {

    const confirm = useConfirm();

    const bulkActions = [
        {
            label: 'Block',
            severity: 'danger',
            icon: LockClosedIcon,
            handler: async (selection) => {
                const confirmed = await confirm(`Block ${selection.length} user${selection.length > 1 ? 's' : ''}?`);
                if (confirmed) {
                    onBulkBlock(selection, true);
                }
            }
        },
        {
            label: 'Unblock',
            icon: LockOpenIcon,
            handler: async (selection) => {
                const confirmed = await confirm(`Unblock ${selection.length} user${selection.length > 1 ? 's' : ''}?`);
                if (confirmed) {
                    onBulkBlock(selection, false);
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
                        User Accounts
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Manage {totalRecords} customers
                    </p>
                </div>

               <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">

                    {/* ADD BUTTON */}
                    <button
                        onClick={onAddCustomer}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <UserPlusIcon className="h-4 w-4" />
                        Add
                    </button>


                    {/* SEARCH */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchValue || ""}
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
                    value={customers}
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
                    dataKey="user_id"

                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    onSelectAll={onSelectAll}

                    showGridlines
                    bulkActions={bulkActions}

                    columns={[
                        {
                            field: 'full_name',
                            header: 'Customer Name',
                            body: (user) => <span className="font-bold text-gray-900">{user.full_name}</span>,
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Name"
                        },
                        {
                            field: 'email',
                            header: 'Email',
                            sortable: true,
                            filter: true,
                            filterPlaceholder: "Filter Email",
                            className: "text-gray-500 font-medium"
                        },
                        {
                            field: 'role',
                            header: 'Role',
                            filterPlaceholder: "Filter Role",
                            body: (user) => (
                                <select
                                    value={user.role}
                                    onChange={(e) => onUpdateRole(user.user_id, e.target.value)}
                                    className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                    <option value="Customer">Customer</option>
                                    <option value="Staff">Staff</option>
                                    <option value="Super Admin">Super Admin</option>
                                </select>
                            )
                        },
                        {
                            field: 'is_blocked',
                            header: 'Status',
                            // sortable: true,
                            // filter: true,
                            dataType: "boolean",
                            filterPlaceholder: "Filter Status",
                            body: (user) => (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.is_blocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {user.is_blocked ? 'Blocked' : 'Active'}
                                </span>
                            )
                        },
                        {
                            header: 'Actions',
                            body: (user) => (
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                          const confirmed = await confirm(user.is_blocked ? `Unblock "${user.full_name}"?` : `Block "${user.full_name}"?`);
                                          if (confirmed) {
                                            onToggleBlock(user.user_id);
                                          }
                                        }}
                                        className={`p-2 rounded-lg transition-all ${user.is_blocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'}`}
                                        title={user.is_blocked ? "Unblock User" : "Block User"}
                                    >
                                        {user.is_blocked ? <LockOpenIcon className="h-5 w-5" /> : <LockClosedIcon className="h-5 w-5" />}
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

export default CustomersManagement;
