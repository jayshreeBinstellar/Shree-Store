import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import ReviewsManagement from '../../components/admin/ReviewsManagement';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import useDataTable from '../../utils/useDataTable.jsx';

const defaultFilters = {
    global: { value: "", matchMode: "contains" },
    product_title: { value: "", matchMode: "contains" },
    full_name: { value: "", matchMode: "contains" },
    rating: { value: null, matchMode: "equals" },
    status: { value: "", matchMode: "equals" }

};

const Reviews = () => {
     const {
       data: reviews,
        loading,
        totalRecords,
        searchValue,
        lazyParams,
        selectedItems: selectedReviews,
        setSelectedItems: setSelectedReviews,
        handleSearch,
        handleLazyLoad,
        handleSelectAll,
        resetFilters,
        fetchData
    } = useDataTable({
        defaultFilters,
        fetchFn: AdminService.getReviews
    });

    // const [reviews, setReviews] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [selectedReviews, setSelectedReviews] = useState([]);
    // const [searchValue, setSearchValue] = useState("");
    // const [lazyParams, setLazyParams] = useState({
    //     first: 0,
    //     rows: 10,
    //     page: 1,
    //     sortField: null,
    //     sortOrder: null,
    //     filters: defaultFilters
    // });
    // const [totalRecords, setTotalRecords] = useState(0);

    // const fetchReviews = async () => {
    //     try {
    //         setLoading(true);
    //         const data = await AdminService.getReviews(lazyParams);
    //         console.log(data, "data");
            
    //         if (data.statusCode === 200) {
    //             setReviews(data.data || []);
    //             setTotalRecords(data.meta?.totalRecords || 0);
    //         }
    //     } catch (err) { console.error(err); }
    //     finally { setLoading(false); }
    // };

    // useEffect(() => {
    //     fetchReviews();
    // }, [lazyParams]);



    // const handleSelectAll = async () => {
    //     try {
    //         setLoading(true);
    //         const params = { ...lazyParams, first: 0, rows: 999999 };
    //         const response = await AdminService.getReviews(params);
    //         if (response?.statusCode === 200) {
    //             const all = response.data || [];
    //             setSelectedReviews(all);
    //             toast.success(`Selected all ${all.length} reviews`);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Failed to select all");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleUpdateReviewStatus = async (id, status) => {
        try {
            await AdminService.updateReviewStatus(id, status);
            toast.success(`Review ${status.toLowerCase()}`);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    const handleBulkStatusUpdate = async (selectedRows, status) => {
        if (!window.confirm(`${status} ${selectedRows.length} reviews?`)) return;
        try {
            const ids = selectedRows.map(r => r.review_id);
            await AdminService.bulkUpdateReviewStatus(ids, status);
            toast.success(`${selectedRows.length} reviews ${status.toLowerCase()}`);
            setSelectedReviews([]);
            fetchData();
        } catch (err) { console.error(err); }
    };


//     const debouncedSearch = useMemo(() =>
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

//   const sanitizeFilters = (filters = {}) => {
//     const safeFilters = {};

//     Object.keys(filters).forEach(key => {
//         const filter = filters[key];
//         if (!filter) return;

//         if (filter.constraints) {
//             safeFilters[key] = {
//                 constraints: filter.constraints.map(c => ({
//                     value: key === "rating"
//                         ? (c.value !== null && c.value !== "" ? Number(c.value) : "")
//                         : (c.value ?? ""),
//                     matchMode: c.matchMode ?? "contains"
//                 }))
//             };
//         } else {
//             safeFilters[key] = {
//                 value: key === "rating"
//                     ? (filter.value !== null && filter.value !== "" ? Number(filter.value) : "")
//                     : (filter.value ?? ""),
//                 matchMode: filter.matchMode ?? "contains"
//             };
//         }
//     });

//     return safeFilters;
// };

//     const handleLazyLoad = (event) => {

//         setLazyParams(prev => ({
//             ...prev,
//             first: event.first,
//             rows: event.rows,
//             sortField: event.sortField,
//             sortOrder: event.sortOrder,
//             filters: sanitizeFilters(event.filters),
//             page: Math.floor(event.first / event.rows) + 1
//         }));

//     };

//     const handleFilterChange = (event) => {
//         setLazyParams(prev => ({
//             ...prev,
//             first: 0,
//             page: 1,
//             filters: sanitizeFilters(event.filters)
//         }));
//     };
    
    if (loading && !reviews.length) return <Loader />;

    return (
        <ReviewsManagement
            reviews={reviews}
            onUpdateStatus={handleUpdateReviewStatus}
            search={searchValue}
            onSearch={handleSearch}
            totalRecords={totalRecords}
            onLazy={handleLazyLoad}
            lazyParams={lazyParams}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            selection={selectedReviews}
            onSelectionChange={setSelectedReviews}
            onSelectAll={handleSelectAll}
            isLoading={loading}
            // onFilter={handleFilterChange}
            onReload={resetFilters}
        />
    );
};

export default Reviews;
