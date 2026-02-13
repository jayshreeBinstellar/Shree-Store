
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import BannersManagement from '../../components/admin/BannersManagement';
import { toast } from 'react-hot-toast';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBanners = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await AdminService.getBanners();
            if (data.status === "success") {
                setBanners(data.banners || []);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch banners");
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleAddBanner = async (formData) => {
        try {
            const result = await AdminService.addBanner(formData);
            if (result.status === "success") {
                toast.success("Banner added successfully");
                await fetchBanners();
                return true;
            } else {
                throw new Error(result.message || "Failed to add banner");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
            throw err;
        }
    };

    const handleUpdateBanner = async (bannerId, formData) => {
        try {
            const result = await AdminService.updateBanner(bannerId, formData);
            if (result.status === "success") {
                toast.success("Banner updated successfully");
                await fetchBanners();
                return true;
            } else {
                throw new Error(result.message || "Failed to update banner");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
            throw err;
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;
        try {
            const result = await AdminService.deleteBanner(id);
            if (result.status === "success") {
                toast.success("Banner deleted successfully");
                await fetchBanners();
            } else {
                throw new Error(result.message || "Failed to delete banner");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete banner");
        }
    };

    if (loading) return (
        <div className="h-96 w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Loading banners...</p>
            </div>
        </div>
    );

    return (
        <div>
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error}
                </div>
            )}
            <BannersManagement
                banners={banners}
                onDelete={handleDeleteBanner}
                onAddClick={handleAddBanner}
                onUpdate={handleUpdateBanner}
            />
        </div>
    )
};

export default Banners;
