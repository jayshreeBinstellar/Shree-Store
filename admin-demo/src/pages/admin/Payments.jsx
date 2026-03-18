import React, { useState, useEffect } from 'react';
import { useConfirm }  from '../../context/ConfirmationContext';
import * as AdminService from '../../services/AdminService';
const { getTransactions } = AdminService;
import TransactionsLog from '../../components/admin/TransactionsLog';
import Loader from '../../components/common/Loader.jsx';
import { toast } from 'react-hot-toast';
import debounce from "lodash.debounce";
import { useMemo } from "react";
import useDataTable from '../../utils/useDataTable.jsx';



const defaultFilters = {
    global: { value: "", matchMode: "contains" },
    payment_id: { value: "", matchMode: "contains" },
    order_id: { value: "", matchMode: "contains" },
};

const Payments = () => {
 const {
       data: transactions,
        loading,
        totalRecords,
        searchValue,
        lazyParams,
        selectedItems: selectedTransactions,
        setSelectedItems: setSelectedTransactions,
        handleSearch,
        handleLazyLoad,
        handleSelectAll,
        resetFilters,
        fetchData
    } = useDataTable({
        defaultFilters,
        fetchFn: AdminService.getTransactions
    });

    const confirm = useConfirm();

    // const [transactions, setTransactions] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [selectedTransactions, setSelectedTransactions] = useState([]);
    // const [searchValue, setSearchValue] = useState("");
    // const [searchText, setSearchText] = useState("");
    // const [lazyParams, setLazyParams] = useState({
    //     first: 0,
    //     rows: 10,
    //     page: 1,
    //     sortField: null,
    //     sortOrder: null,
    //     filters: defaultFilters
    // });
    // const [totalRecords, setTotalRecords] = useState(0);

    // const fetchTransactions = async () => {
    //     try {
    //         setLoading(true);
    //         const data = await getTransactions(lazyParams);
    //         if (data.statusCode === 200) {
    //             setTransactions(data.data || []);
    //             setTotalRecords(data.meta?.totalRecords || 0);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Failed to fetch transactions");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchTransactions();
    // }, [lazyParams]);

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

    //  const handleSearch = debounce((value) => {
    //         setLazyParams(prev => ({
    //             ...prev,
    //             first: 0,
    //             page: 1,
    //             filters: {
    //                 ...prev.filters,
    //                 global: { value, matchMode: 'contains' }
    //             }
    //         }));
    //     }, 1000)

    // const debouncedSearch = useMemo(() =>
    //     debounce((value) => {
    //         setLazyParams(prev => ({
    //             ...prev,
    //             first: 0,
    //             page: 1,
    //             filters: {
    //                 ...prev.filters,
    //                 global: {
    //                     value: value || "",
    //                     matchMode: "contains"
    //                 }
    //             }
    //         }));
    //     }, 500)
    //     , []);

    // useEffect(() => {
    //     return () => debouncedSearch.cancel();
    // }, [debouncedSearch]);

    // const handleSearch = (value) => {
    //     setSearchValue(value);
    //     debouncedSearch(value);
    // };
    // const handleSelectAll = async () => {
    //     try {
    //         setLoading(true);
    //         const params = { ...lazyParams, first: 0, rows: 999999 };
    //         const response = await AdminService.getTransactions(params);
    //         if (response?.statusCode === 200) {
    //             const all = response.data || [];
    //             setSelectedTransactions(all);
    //             toast.success(`Selected all ${all.length} transactions`);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Failed to select all");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleBulkStatusUpdate = async (selectedRows, status) => {
        const confirmed = await confirm(`${status} ${selectedRows.length} transactions?`);
        if (!confirmed) return;
        try {
            const ids = selectedRows.map(t => t.transaction_id || t.payment_id);
            await AdminService.bulkUpdateTransactionStatus(ids, status);
            toast.success(`${selectedRows.length} transactions ${status.toLowerCase()}`);
            setSelectedTransactions([]);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Bulk update failed");
        }
    };

    if (loading && !transactions.length) return <Loader />;

    return (
        <TransactionsLog
            transactions={transactions}
            search={searchValue}
            onSearch={handleSearch}
            totalRecords={totalRecords}
            onLazy={handleLazyLoad}
            lazyParams={lazyParams}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            selection={selectedTransactions}
            onSelectionChange={setSelectedTransactions}
            onSelectAll={handleSelectAll}
            isLoading={loading}
            onReload={resetFilters}
        // search={lazyParams.filters.global.value}
        />
    );
};

export default Payments;
