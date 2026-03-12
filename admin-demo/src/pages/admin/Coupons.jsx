import React, { useState, useEffect } from 'react';
import { useConfirm }  from '../../context/ConfirmationContext';
import * as AdminService from '../../services/AdminService';
import CouponsManagement from '../../components/admin/CouponsManagement';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import { XMarkIcon } from "@heroicons/react/24/outline";
import useDataTable from '../../utils/useDataTable.jsx';

const defaultFilters = {
    global: { value: "", matchMode: "contains" },
    code: { value: "", matchMode: "contains" },
    discount_value: { value: "", matchMode: "equals" },
    min_order_value: { value: "", matchMode: "equals" }
};

const Coupons = () => {

 const {
       data: coupons,
        loading,
        totalRecords,
        searchValue,
        lazyParams,
        selectedItems: selectedCoupons,
        setSelectedItems: setSelectedCoupons,
        handleSearch,
        handleLazyLoad,
        handleSelectAll,
        resetFilters,
        fetchData
    } = useDataTable({
        defaultFilters,
        fetchFn: AdminService.getCoupons
    });

//     const [coupons, setCoupons] = useState([]);
//     const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
//     const [searchValue, setSearchValue] = useState("");
//     const [selectedCoupons, setSelectedCoupons] = useState([]);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'cart_percent',
        discount_value: '',
        min_order_value: '0',
        usage_limit: '100',
        expiry_date: ''
    });

//     const [lazyParams, setLazyParams] = useState({
//         first: 0,
//         rows: 10,
//         page: 1,
//         sortField: null,
//         sortOrder: null,
//         filters: defaultFilter
//     });
//     const [totalRecords, setTotalRecords] = useState(0);

//     const fetchCoupons = async () => {
//         try {
//             setLoading(true);
//             const data = await AdminService.getCoupons(lazyParams);
//             if (data.statusCode === 200) {
//                 setCoupons(data.data || []);
//                 setTotalRecords(data.meta?.totalRecords || 0);
//             }
//         } catch (err) { console.error(err); }
//         finally { setLoading(false); }
//     };

//     useEffect(() => {
//         fetchCoupons();
//     }, [lazyParams]);

//   const sanitizeFilters = (filters = {}) => {
//     const safeFilters = {};

//     Object.keys(filters).forEach(key => {
//         const filter = filters[key];
//         if (!filter) return;

//         if (filter.constraints) {
//             safeFilters[key] = {
//                 constraints: filter.constraints.map(c => ({
//                     value: c.value ?? "",
//                     matchMode: c.matchMode ?? "contains"
//                 }))
//             };
//         } else {
//             safeFilters[key] = {
//                 value: filter.value ?? "",
//                 matchMode: filter.matchMode ?? "contains"
//             };
//         }
//     });

//     return safeFilters;
// };

// const handleLazyLoad = (event) => {
//     setLazyParams(prev => ({
//         ...prev,
//         first: event.first,
//         rows: event.rows,
//         page: Math.floor(event.first / event.rows) + 1,
//         sortField: event.sortField,
//         sortOrder: event.sortOrder,
//         filters: sanitizeFilters(event.filters)
//     }));
// };

// const debouncedSearch = useMemo(() =>
//         debounce((value) => {
//             setLazyParams(prev => ({
//                 ...prev,
//                 first: 0,
//                 page: 1,
//                 filters: {
//                     ...prev.filters,
//                     global: {
//                         value: value || "",
//                         matchMode: "contains"
//                     }
//                 }
//             }));
//         }, 500)
//         , []);

//     useEffect(() => {
//         return () => debouncedSearch.cancel();
//     }, [debouncedSearch]);

//     const handleSearch = (value) => {
//         setSearchValue(value);
//         debouncedSearch(value);
//     };

//     const handleSelectAll = async () => {
//         try {
//             setLoading(true);
//             const params = { ...lazyParams, first: 0, rows: 999999 };
//             const response = await AdminService.getCoupons(params);
//             if (response?.statusCode === 200) {
//                 const all = response.data || [];
//                 setSelectedCoupons(all);
//                 toast.success(`Selected all ${all.length} coupons`);
//             }
//         } catch (err) {
//             console.error(err);
//             toast.error("Failed to select all");
//         } finally {
//             setLoading(false);
//         }
//     };

    const handleBulkDelete = async (selectedRows) => {
        const confirmed = await confirm(`Delete ${selectedRows.length} coupons?`);
        if (!confirmed) return;
        try {
            const ids = selectedRows.map(c => c.coupon_id);
            await AdminService.bulkDeleteCoupons(ids);
            toast.success("Coupons deleted");
            setSelectedCoupons([]);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteCoupon = async (id) => {
        const confirmed = await confirm("Delete coupon?");
        if (!confirmed) return;
        try {
            await AdminService.deleteCoupon(id);
            toast.success("Coupon deleted");
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete coupon");
        }
    };

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        try {
            await AdminService.addCoupon(formData);
            toast.success("Coupon added successfully");
            setShowModal(false);
            setFormData({
                code: '',
                discount_type: 'cart_percent',
                discount_value: '',
                min_order_value: '0',
                usage_limit: '100',
                expiry_date: ''
            });
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add coupon");
        }
    };

    if (loading && !coupons.length) return <Loader />;

    return (
        <>
            <CouponsManagement
                coupons={coupons}
                onDelete={handleDeleteCoupon}
                onAddClick={() => setShowModal(true)}
                search={searchValue}
                onSearch={handleSearch}
                totalRecords={totalRecords}
                onLazy={handleLazyLoad}
                lazyParams={lazyParams}
                onBulkDelete={handleBulkDelete}
                selection={selectedCoupons}
                onSelectionChange={setSelectedCoupons}
                onSelectAll={handleSelectAll}
                isLoading={loading}
                onReload={resetFilters}
            />

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 text-xs lg:text-sm">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">New Coupon</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <XMarkIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleAddCoupon} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none uppercase placeholder:text-gray-300 transition-all"
                                    placeholder="e.g. SUMMER2024"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-gray-600 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="cart_percent">Percent Off</option>
                                        <option value="cart_fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Value</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.discount_value}
                                        onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Value"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Min Order ($)</label>
                                    <input
                                        type="number"
                                        value={formData.min_order_value}
                                        onChange={e => setFormData({ ...formData, min_order_value: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={formData.usage_limit}
                                        onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Expiry Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.expiry_date}
                                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] mt-2">
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Coupons;
