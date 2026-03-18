import React, { useState, useEffect } from 'react';
import { useConfirm }  from '../../context/ConfirmationContext';
import * as AdminService from '../../services/AdminService';
import BannersManagement from '../../components/admin/BannersManagement';
import BannerModal from '../../components/admin/BannerModal';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader';
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);

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
