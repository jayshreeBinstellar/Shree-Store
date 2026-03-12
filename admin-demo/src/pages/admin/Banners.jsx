import React, { useState, useEffect } from 'react';
import { useConfirm }  from '../../context/ConfirmationContext';
import * as AdminService from '../../services/AdminService';
import BannersManagement from '../../components/admin/BannersManagement';
import BannerModal from '../../components/admin/BannerModal';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import debounce from 'lodash.debounce';
import { useMemo } from 'react';
import useDataTable from '../../utils/useDataTable';

const defaultFilters = {
    global: { value: '', matchMode: 'contains' },
    position: { value: '', matchMode: 'contains' }
};


const Banners = () => {
 const {
       data: banners,
        loading,
        totalRecords,
        searchValue,
        lazyParams,
        selectedItems: selectedBanners,
        setSelectedItems: setSelectedBanners,
        handleSearch,
        handleLazyLoad,
        handleSelectAll,
        resetFilters,
        fetchData
    } = useDataTable({
        defaultFilters,
        fetchFn: AdminService.getBanners
    });

    const confirm = useConfirm();

    // const [banners, setBanners] = useState([]);
    // const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    // const [totalRecords, setTotalRecords] = useState(0);
    // const [selectedBanners, setSelectedBanners] = useState([]);
    // const [searchValue, setSearchValue] = useState("");
    // const [lazyParams, setLazyParams] = useState({
    //     first: 0,
    //     rows: 10,
    //     page: 1,
    //     sortField: null,
    //     sortOrder: null,
    //     filters: defaultFilters
    // });

    // const fetchBanners = async () => {
    //     try {
    //         setLoading(true);
    //         const data = await AdminService.getBanners(lazyParams);
    //         if (data.statusCode === 200) {
    //             setBanners(data.data || []);
    //             setTotalRecords(data.meta?.totalRecords || 0);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //          toast.error("Failed to fetch banners");
    //     }
    //     finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchBanners();
    // }, [lazyParams]);






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

    // const sanitizeFilters = (filters = {}) => {

    //     const safeFilters = {};

    //     Object.keys(filters).forEach(key => {
    //         const filter = filters[key];
    //         if (!filter) return;

    //         // Handle both simple values and constraint-based filters
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

    // const handleSelectAll = async () => {
    //     try {
    //         setLoading(true);
    //         const params = {
    //             ...lazyParams,
    //             first: 0,
    //             rows: 999999
    //         };
    //         const response = await AdminService.getBanners(params);
    //         if (response?.statusCode === 200) {
    //             const all = response.data || [];
    //             setSelectedBanners(all);
    //             toast.success(`Selected all ${all.length} banners`);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Failed to select all");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleBulkDelete = async (selectedRows) => {
        const confirmed = await confirm(`Are you sure you want to delete ${selectedRows.length} banners?`);
        if (!confirmed) return;
        try {
            const ids = selectedRows.map(b => b.banner_id);
            await AdminService.bulkDeleteBanners(ids);
            toast.success("Banners deleted");
            setSelectedBanners([]);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleAddBanner = async (formData) => {
        try {
            const result = await AdminService.addBanner(formData);
            if (result.status === "success") {
                toast.success("Banner added successfully");
                setIsModalOpen(false);
                fetchData();
            } else {
                throw new Error(result.message || "Failed to add banner");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    const handleUpdateBanner = async (formData) => {
        try {
            const result = await AdminService.updateBanner(selectedBanner.banner_id, formData);
            if (result.status === "success") {
                toast.success("Banner updated successfully");
                setIsModalOpen(false);
                fetchData();
            } else {
                throw new Error(result.message || "Failed to update banner");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    const handleDeleteBanner = async (id) => {
        const confirmed = await confirm("Are you sure you want to delete this banner?");
        if (!confirmed) return;
        try {
            const result = await AdminService.deleteBanner(id);
            if (result.status === "success") {
                toast.success("Banner deleted successfully");
                fetchData();
            } else {
                throw new Error(result.message || "Failed to delete banner");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete banner");
        }
    };

    if (loading && !banners.length) return <Loader message="Loading banners..." />;

    return (
        <div>
            <BannersManagement
                banners={banners}
                onDelete={handleDeleteBanner}
                onAddClick={() => { setSelectedBanner(null); setIsModalOpen(true); }}
                onEdit={(banner) => { setSelectedBanner(banner); setIsModalOpen(true); }}
                onSearch={handleSearch}
                searchValue={searchValue}
                totalRecords={totalRecords}
                onLazy={handleLazyLoad}
                lazyParams={lazyParams}
                onBulkDelete={handleBulkDelete}
                isLoading={loading}
                selection={selectedBanners}
                onSelectionChange={setSelectedBanners}
                onSelectAll={handleSelectAll}
                onReload={resetFilters}
            />
            <BannerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={selectedBanner ? handleUpdateBanner : handleAddBanner}
                banner={selectedBanner}
            />
        </div>
    )
};

export default Banners;
