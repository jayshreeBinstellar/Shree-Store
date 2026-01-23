import React, { useState, useEffect } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import * as AdminService from "../../services/AdminService";
import BASE_URL from "../../api/ApiConstant";

const BannerModal = ({ isOpen, onClose, onSubmit, banner = null }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image_url: "",
        position: "homepage",
        display_order: 0,
        is_active: true
    });

    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [imageSource, setImageSource] = useState("url"); // "url" or "upload"

    useEffect(() => {
        if (banner) {
            setFormData({
                title: banner.title || "",
                description: banner.description || "",
                image_url: banner.image_url || "",
                position: banner.position || "homepage",
                display_order: banner.display_order || 0,
                is_active: banner.is_active !== false
            });
            setPreview(banner.image_url || "");
        } else {
            setFormData({
                title: "",
                description: "",
                image_url: "",
                position: "homepage",
                display_order: 0,
                is_active: true
            });
            setPreview("");
        }
        setError("");
    }, [banner, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        if (name === "image_url") {
            setPreview(value);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file");
            return;
        }

        setError("");
        setUploading(true);

        try {
            const result = await AdminService.uploadBannerImage(file);
            console.log("Upload result:", result);
            if (result.status === "success") {
                const imageUrl = result.imageUrl || result.url;
                console.log("Image URL:", imageUrl);
                setFormData(prev => ({
                    ...prev,
                    image_url: imageUrl
                }));
                setPreview(imageUrl);
                setError("");
            } else {
                setError(result.message || "Failed to upload image");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError("Title is required");
            return false;
        }
        if (!formData.image_url.trim()) {
            setError("Image URL is required");
            return false;
        }
        if (!formData.position.trim()) {
            setError("Position is required");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError(err.message || "Failed to save banner");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[24px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className=" top-0 bg-gradient-to-r p-6 border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
                        {banner ? "Edit Banner" : "Create New Banner"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* Form */}    
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">
                            Banner Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Summer Fresh Produce"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter banner description"
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Image Source Toggle */}
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="imageSource"
                                value="url"
                                checked={imageSource === "url"}
                                onChange={(e) => setImageSource(e.target.value)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-bold text-gray-700">From URL</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="imageSource"
                                value="upload"
                                checked={imageSource === "upload"}
                                onChange={(e) => setImageSource(e.target.value)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-bold text-gray-700">Upload File</span>
                        </label>
                    </div>

                    {/* Image Input - URL */}
                    {imageSource === "url" ? (
                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">
                                Image URL *
                            </label>
                            <input
                                type="text"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleInputChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">
                                Upload Image *
                            </label>
                            <label className="relative block w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <PhotoIcon className="h-8 w-8 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">
                                            {uploading ? "Uploading..." : "Click to upload or drag image"}
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    )}

                    {/* Image Preview */}
                    {preview && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Preview</p>
                            <img
                                src={`${BASE_URL}${preview}`}
                                alt="Banner preview"
                                className="w-full h-40 object-cover rounded-lg"
                                onError={(e) => {
                                    console.error("Image preview failed to load:", preview);
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='160'%3E%3Crect fill='%23f3f4f6' width='400' height='160'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='system-ui' font-size='14'%3EFailed to load image%3C/text%3E%3C/svg%3E";
                                }}
                            />
                        </div>
                    )}



                    {/* Position and Order */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">
                                Position *
                            </label>
                            <select
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <optgroup label="Main Pages">
                                    <option value="homepage">Homepage</option>
                                    <option value="products">Products Page</option>
                                    <option value="about">About Page</option>
                                    <option value="contact">Contact Page</option>
                                    <option value="footer">Footer (All Pages)</option>
                                </optgroup>
                                <optgroup label="Category Pages">
                                    <option value="category">All Categories</option>
                                    <option value="fashion">Fashion</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="bag">Bags & Accessories</option>
                                    <option value="footwear">Footwear</option>
                                    <option value="grocery">Grocery</option>
                                    <option value="beauty">Beauty & Skincare</option>
                                </optgroup>
                                <optgroup label="Other">
                                    <option value="sidebar">Sidebar</option>
                                    <option value="popup">Popup</option>
                                </optgroup>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">
                                Display Order
                            </label>
                            <input
                                type="number"
                                name="display_order"
                                value={formData.display_order}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Active (Visible on website)
                        </label>
                    </div>



                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-black rounded-xl hover:bg-gray-50 transition-colors uppercase text-xs tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs tracking-widest"
                        >
                            {loading ? "Saving..." : "Save Banner"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BannerModal;
