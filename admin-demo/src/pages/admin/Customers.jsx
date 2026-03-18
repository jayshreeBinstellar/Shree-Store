import React, { useState, useEffect, useMemo } from 'react';
import * as AdminService from '../../services/AdminService';
import CustomersManagement from '../../components/admin/CustomersManagement';
import AddCustomerModal from '../../components/admin/AddCustomerModal';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import useDataTable from '../../utils/useDataTable.jsx';

const defaultFilters = {
    global: { value: "", matchMode: "contains" },
    full_name: { value: "", matchMode: "contains" },
    email: { value: "", matchMode: "contains" }
};

const Customers = () => {
   const {
        data: customers ,
        loading,
        totalRecords,
        searchValue,
        selectedItems: selectedCustomers,
        setSelectedItems: setSelectedCustomers,
        lazyParams,
        setLazyParams,
        handleSearch,
        handleLazyLoad,
        handleSelectAll,
        fetchData,
        resetFilters
    } = useDataTable({
        defaultFilters,
        fetchFn: AdminService.getUser
    });
   


    // const [customers, setCustomers] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [totalRecords, setTotalRecords] = useState(0);
    // const [searchValue, setSearchValue] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // const [selectedCustomers, setSelectedCustomers] = useState([]);

    // const [lazyParams, setLazyParams] = useState({
    //     first: 0,
    //     rows: 10,
    //     page: 1,
    //     sortField: null,
    //     sortOrder: null,
    //     filters: defaultFilters
    // });

    // /* ================= FETCH ================= */
    // const fetchCustomers = async () => {
    //     try {
    //         setLoading(true);
    //         const res = await AdminService.getUser(lazyParams);

    //         if (res?.statusCode === 200) {
    //             setCustomers(res.data || []);
    //             setTotalRecords(res.meta?.totalRecords || 0);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Failed to fetch customers");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchCustomers();
    // }, [lazyParams]);

    // /* ================= SELECT ALL ================= */
    // const handleSelectAll = async () => {
    //     try {
    //         setLoading(true);
    //         const params = { ...lazyParams, first: 0, rows: 999999 };
    //         const res = await AdminService.getUser(params);

    //         if (res?.statusCode === 200) {
    //             setSelectedCustomers(res.data || []);
    //             toast.success(`Selected ${res.data.length} customers`);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleBulkBlock = async (selectedRows, isBlocked) => {
        if (!selectedRows.length) return;
        try {
            const ids = selectedRows.map(u => u.user_id);
            await AdminService.bulkToggleCustomerBlock(ids, isBlocked);
            toast.success(`Users ${isBlocked ? 'blocked' : 'unblocked'}`);
            setSelectedCustomers([]);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Action failed");
        }
    };

    const handleAddCustomer = async (formData) => {
        try {
            const res = await AdminService.addCustomer(formData);
            if (res.status === "success") {
                toast.success("Customer created successfully!");
                fetchData();
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            toast.error(err.message || "Failed to add customer");
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
    //                 global: { value: value || "", matchMode: "contains" }
    //             }
    //         }));
    //     }, 500), []
    // );

    // useEffect(() => {
    //     return () => debouncedSearch.cancel();
    // }, [debouncedSearch]);

    // const handleSearch = (value) => {
    //     setSearchValue(value);
    //     debouncedSearch(value);
    // };

    // const sanitizeFilters = (filters = {}) => {
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
    //         sortField: event.sortField,
    //         sortOrder: event.sortOrder,
    //         filters: sanitizeFilters(event.filters),
    //         page: Math.floor(event.first / event.rows) + 1
    //     }));
    // };

    const handleToggleBlock = async (id) => {
        try {
            await AdminService.toggleCustomerBlock(id);
            toast.success("User status updated");
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    const handleUpdateUserRole = async (id, role) => {
        try {
            await AdminService.updateCustomerRole(id, role);
            toast.success("User role updated");
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update role");
        }
    };

    if (loading && !customers.length) return <Loader />;

    return (
        <>
            <CustomersManagement
                customers={customers}
                isLoading={loading}
                totalRecords={totalRecords}
                searchValue={searchValue}
                onSearch={handleSearch}
                onLazy={handleLazyLoad}
                lazyParams={lazyParams}
                selection={selectedCustomers}
                onSelectionChange={setSelectedCustomers}
                onSelectAll={handleSelectAll}
                onBulkBlock={handleBulkBlock}
                onToggleBlock={handleToggleBlock}
                onUpdateRole={handleUpdateUserRole}
                onAddCustomer={() => setIsAddModalOpen(true)}
                onReload={resetFilters}
            />
            <AddCustomerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddCustomer}
            />
        </>
    );
};

export default Customers;