import React, { useState, useEffect, useMemo } from 'react';
import * as AdminService from '../../services/AdminService';
import ShippingOptionsManagement from '../../components/admin/ShippingOptionsManagement';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import debounce from 'lodash.debounce';
import useDataTable from '../../utils/useDataTable.jsx';

const defaultFilters = {
    global: { value: '', matchMode: 'contains' },
    name: { value: '', matchMode: 'contains' },
    cost: { value: '', matchMode: 'equals' },
    estimated_days: { value: '', matchMode: 'contains' }
};

const Shipping = () => {

 const {
       data: options,
        loading,
        totalRecords,
        searchValue,
        lazyParams,
        selectedItems: selectedOptions,
        setSelectedItems: setSelectedOptions,
        handleSearch,
        handleLazyLoad,
        handleSelectAll,
        resetFilters,
        fetchData
    } = useDataTable({
        defaultFilters,
        fetchFn: AdminService.getShippingOptions
    });


    // const [options, setOptions] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [totalRecords, setTotalRecords] = useState(0);
    // const [searchValue, setSearchValue] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentOption, setCurrentOption] = useState({ name: '', cost: '', estimated_days: '' });
    // const [selectedOptions, setSelectedOptions] = useState([]);

    // const [lazyParams, setLazyParams] = useState({
    //     first: 0,
    //     rows: 10,
    //     page: 1,
    //     sortField: null,
    //     sortOrder: null,
    //     filters: defaultFilters
    // });

    // /* ================= FETCH ================= */
    // const fetchOptions = async () => {
    //     try {
    //         setLoading(true);
    //         const res = await AdminService.getShippingOptions(lazyParams);
    //         if (res?.statusCode === 200) {
    //             setOptions(res.data || []);
    //             setTotalRecords(res.meta?.totalRecords || 0);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Failed to fetch shipping options");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchOptions();
    // }, [lazyParams]);

    // /* ================= SELECT ALL ================= */
    // const handleSelectAll = async () => {
    //     try {
    //         setLoading(true);
    //         const params = { ...lazyParams, first: 0, rows: 999999 };
    //         const res = await AdminService.getShippingOptions(params);
    //         if (res?.statusCode === 200) {
    //             setSelectedOptions(res.data || []);
    //             toast.success(`Selected ${res.data.length} options`);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    /* ================= BULK DELETE ================= */
    const handleBulkDelete = async (selectedRows) => {
        if (!selectedRows.length) return;
        if (!window.confirm(`Delete ${selectedRows.length} shipping options?`)) return;
        try {
            const ids = selectedRows.map(o => o.shipping_id);
            await Promise.all(ids.map(id => AdminService.deleteShippingOption(id)));
            toast.success("Shipping options deleted");
            setSelectedOptions([]);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete options");
        }
    };

    // /* ================= SEARCH ================= */
    // const debouncedSearch = useMemo(() =>
    //     debounce((value) => {
    //         setLazyParams(prev => ({
    //             ...prev,
    //             first: 0,
    //             page: 1,
    //             filters: {
    //                 ...prev.filters,
    //                 global: { value: value || '', matchMode: 'contains' }
    //             }
    //         }));
    //     }, 500)
    // , []);

    // useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

    // const handleSearch = (value) => {
    //     setSearchValue(value);
    //     debouncedSearch(value);
    // };

    // /* ================= LAZY LOAD ================= */
    // const sanitizeFilters = (filters = {}) => {
    //     const safeFilters = {};
    //     Object.keys(filters).forEach(key => {
    //         const filter = filters[key];
    //         if (!filter) return;
    //         safeFilters[key] = {
    //             value: filter.value ?? '',
    //             matchMode: filter.matchMode ?? 'contains'
    //         };
    //     });
    //     return safeFilters;
    // };

    // const handleLazyLoad = (event) => {
    //     setLazyParams(prev => ({
    //         ...prev,
    //         first: event.first,
    //         rows: event.rows,
    //         sortField: event.sortField,
    //         sortOrder: event.sortOrder,
    //         filters: sanitizeFilters(event.filters),
    //         page: Math.floor(event.first / event.rows) + 1
    //     }));
    // };

    /* ================= MODAL SAVE ================= */
    const handleSaveOption = async (e) => {
        e.preventDefault();
        try {
            if (currentOption.shipping_id) {
                await AdminService.updateShippingOption(currentOption.shipping_id, currentOption);
                toast.success("Shipping option updated");
            } else {
                await AdminService.addShippingOption(currentOption);
                toast.success("Shipping option added");
            }
            setShowModal(false);
            setCurrentOption({ name: '', cost: '', estimated_days: '' });
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save option");
        }
    };

    /* ================= DELETE SINGLE ================= */
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this shipping option?")) return;
        try {
            await AdminService.deleteShippingOption(id);
            toast.success("Shipping option deleted");
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete option");
        }
    };

    /* ================= OPEN MODAL ================= */
    const openModal = (option = { name: '', cost: '', estimated_days: '' }) => {
        setCurrentOption(option);
        setShowModal(true);
    };

    if (loading && !options.length) return <Loader message="Loading shipping options..." />;

    return (
        <>
            <ShippingOptionsManagement
                options={options}
                isLoading={loading}
                totalRecords={totalRecords}
                searchValue={searchValue}
                onSearch={handleSearch}
                onLazy={handleLazyLoad}
                lazyParams={lazyParams}
                selection={selectedOptions}
                onSelectionChange={setSelectedOptions}
                onSelectAll={handleSelectAll}
                onBulkDelete={handleBulkDelete}
                onAddClick={() => openModal()}
                onEditClick={openModal}
                onDelete={handleDelete}
                onReload={resetFilters}
            />

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">
                                {currentOption.shipping_id ? 'Edit Method' : 'New Method'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSaveOption} className="space-y-5">
                            <input
                                type="text"
                                required
                                value={currentOption.name}
                                onChange={e => setCurrentOption({ ...currentOption, name: e.target.value })}
                                placeholder="Method Name"
                                className="w-full border px-4 py-3 rounded-xl"
                            />
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={currentOption.cost}
                                onChange={e => setCurrentOption({ ...currentOption, cost: e.target.value })}
                                placeholder="Cost ($)"
                                className="w-full border px-4 py-3 rounded-xl"
                            />
                            <input
                                type="text"
                                required
                                value={currentOption.estimated_days}
                                onChange={e => setCurrentOption({ ...currentOption, estimated_days: e.target.value })}
                                placeholder="Est. Days"
                                className="w-full border px-4 py-3 rounded-xl"
                            />
                            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-2xl">
                                {currentOption.shipping_id ? 'Update Method' : 'Create Method'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Shipping;