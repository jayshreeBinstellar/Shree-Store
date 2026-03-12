
import { useState, useEffect, useMemo, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { toast } from 'react-hot-toast';

const useDataTable = ({ 
    defaultFilters = {}, 
    fetchFn, 
    debounceMs = 500 
}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchValue, setSearchValue] = useState("");
    
    const [selectedItems, setSelectedItems] = useState([]);

    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,
        filters: defaultFilters
    });

    const fetchData = useCallback(async () => {
        if (!fetchFn) return;
        
        try {
            setLoading(true);
            const res = await fetchFn(lazyParams);
            
            if (res?.statusCode === 200 || res?.status === 'success') {
                setData(res.data || []);
                setTotalRecords(res.meta?.totalRecords || res.data?.length || 0);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }, [fetchFn, lazyParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                setLazyParams((prev) => ({
                    ...prev,
                    first: 0,
                    page: 1,
                    filters: {
                        ...prev.filters,
                        global: { value: value || "", matchMode: "contains" }
                    }
                }));
            }, debounceMs),
        [debounceMs]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleSearch = useCallback((value) => {
        setSearchValue(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    const sanitizeFilters = useCallback((filters = {}) => {
        const safeFilters = {};
        Object.keys(filters).forEach((key) => {
            const filter = filters[key];
            if (!filter) return;

            if (filter.constraints) {
                safeFilters[key] = {
                    constraints: filter.constraints.map((c) => ({
                        value: c.value ?? "",
                        matchMode: c.matchMode ?? "contains"
                    }))
                };
            } else {
                safeFilters[key] = {
                    value: filter.value ?? "",
                    matchMode: filter.matchMode ?? "contains"
                };
            }
        });
        return safeFilters;
    }, []);

    const handleLazyLoad = useCallback((event) => {
        setLazyParams((prev) => ({
            ...prev,
            first: event.first,
            rows: event.rows,
            sortField: event.sortField,
            sortOrder: event.sortOrder,
            filters: sanitizeFilters(event.filters),
            page: Math.floor(event.first / event.rows) + 1
        }));
    }, [sanitizeFilters]);

    const handleSelectAll = useCallback(async () => {
        if (!fetchFn) return;
        
        try {
            setLoading(true);
            const params = {
                ...lazyParams,
                first: 0,
                rows: 999999
            };

            const res = await fetchFn(params);

            if (res?.statusCode === 200 || res?.status === 'success') {
                const allItems = res.data || [];
                setSelectedItems(allItems);
                toast.success(`Selected all ${allItems.length} items`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to select all");
        } finally {
            setLoading(false);
        }
    }, [fetchFn, lazyParams]);

    const clearSelection = useCallback(() => {
        setSelectedItems([]);
    }, []);

    const resetFilters = useCallback(() => {
        setSearchValue("");
        setSelectedItems([]);
        setLazyParams({
            first: 0,
            rows: 10,
            page: 1,
            sortField: null,
            sortOrder: null,
            filters: defaultFilters
        });
    }, [defaultFilters]);

    const updateFilter = useCallback((key, value, matchMode = "equals") => {
        setLazyParams((prev) => ({
            ...prev,
            first: 0,
            page: 1,
            filters: {
                ...prev.filters,
                [key]: { value, matchMode }
            }
        }));
    }, []);

    return {
        data,
        setData,
        loading,
        totalRecords,
        searchValue,
        
        selectedItems,
        setSelectedItems,
        
        lazyParams,
        setLazyParams,
        
        handleSearch,
        handleLazyLoad,
        handleSelectAll,
        clearSelection,
        resetFilters,
        updateFilter,
        sanitizeFilters,
        fetchData,
        
        isEmpty: !loading && data.length === 0,
        hasSelection: selectedItems.length > 0
    };
};

export default useDataTable;
