import React, { useState, useEffect } from "react";
import { TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import BannerModal from "./BannerModal";
import BASE_URL from "../../api/ApiConstant";

const BannersManagement = ({ banners = [], onDelete, onAddClick, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [bannersData, setBannersData] = useState(banners);
    const itemsPerPage = 6;

    useEffect(() => {
        setBannersData(banners);
    }, [banners]);

    const handleAddNew = () => {
        setSelectedBanner(null);
        setIsModalOpen(true);
    };

    const handleEdit = (banner) => {
        setSelectedBanner(banner);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedBanner(null);
    };

    const handleModalSubmit = async (formData) => {
        if (selectedBanner) {
            // Update existing banner
            await onUpdate(selectedBanner.banner_id, formData);
        } else {
            // Add new banner
            await onAddClick(formData);
        }
        handleModalClose();
    };

    const handleDeleteBanner = (bannerId) => {
        if (window.confirm("Are you sure you want to delete this banner?")) {
            onDelete(bannerId);
        }
    };

    const paginatedBanners = bannersData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const positionColors = {
        homepage: "bg-blue-100 text-blue-600",
        products: "bg-orange-100 text-orange-600",
        about: "bg-cyan-100 text-cyan-600",
        contact: "bg-teal-100 text-teal-600",
        footer: "bg-green-100 text-green-600",
        category: "bg-indigo-100 text-indigo-600",
        fashion: "bg-pink-100 text-pink-600",
        electronics: "bg-yellow-100 text-yellow-600",
        bag: "bg-rose-100 text-rose-600",
        footwear: "bg-lime-100 text-lime-600",
        grocery: "bg-emerald-100 text-emerald-600",
        beauty: "bg-violet-100 text-violet-600",
        sidebar: "bg-purple-100 text-purple-600",
        popup: "bg-red-100 text-red-600"
    };

    return (
        <>
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-gray-50 to-blue-50">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Promotion Banners</h3>
                        <p className="text-xs text-gray-500 mt-1">Manage website banners and promotions</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                        + Add New Banner
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {paginatedBanners.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedBanners.map((banner) => (
                                    <div
                                        key={banner.banner_id}
                                        className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-[24px] overflow-hidden border border-gray-200 hover:border-indigo-300 transition-all hover:shadow-lg"
                                    >
                                        {/* Image Container */}
                                        <div className="relative h-48 bg-gray-300 overflow-hidden">
                                            <img
                                                src={`${BASE_URL}${banner.image_url}`}
                                                alt={banner.alt_text || banner.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {!banner.is_active && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <span className="text-white font-black text-sm">INACTIVE</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            {/* Status Badge */}
                                            <div className="flex gap-2 mb-3 flex-wrap">
                                                <span
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                        positionColors[banner.position] ||
                                                        "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {banner.position}
                                                </span>
                                                {banner.route && (
                                                    <span className="px-2 py-1 bg-cyan-100 text-cyan-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                        Route: {banner.route}
                                                    </span>
                                                )}
                                                {banner.display_order > 0 && (
                                                    <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                        Order: {banner.display_order}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h4 className="font-black text-gray-900 text-sm mb-1 line-clamp-2">
                                                {banner.title}
                                            </h4>

                                            {/* Description */}
                                            {banner.description && (
                                                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                                    {banner.description}
                                                </p>
                                            )}

                                            {/* Link Preview */}
                                            {banner.link_url && (
                                                <p className="text-xs text-indigo-600 truncate mb-3 font-medium">
                                                    {banner.link_url}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(banner)}
                                                className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Edit banner"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBanner(banner.banner_id)}
                                                className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Delete banner"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Status Indicator */}
                                        <div className="absolute bottom-4 right-4">
                                            {banner.is_active ? (
                                                <div className="p-2 bg-green-100 rounded-lg text-green-600" title="Active">
                                                    <EyeIcon className="h-4 w-4" />
                                                </div>
                                            ) : (
                                                <div className="p-2 bg-gray-100 rounded-lg text-gray-400" title="Inactive">
                                                    <EyeSlashIcon className="h-4 w-4" />
                                                </div>
                                            )}  
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="mb-4">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 font-medium italic">No banners created yet.</p>
                            <p className="text-gray-300 text-sm mt-2">Click "Add New Banner" to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Banner Modal */}
            <BannerModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleModalSubmit}
                banner={selectedBanner}
            />
        </>
    );
};

export default BannersManagement;

