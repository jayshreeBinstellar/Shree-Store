import React, { useState } from "react";
import { Modal, Box } from "@mui/material";
import * as AdminService from "../../services/AdminService";

const ProductModal = ({
    open,
    onClose,
    editingProduct,
    formData,
    handleFormChange,
    handleSubmit,
    categories
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let thumbnailUrl = formData.thumbnail;

            // Upload image if a file is selected
            if (selectedFile) {
                const uploadResult = await AdminService.uploadProductImage(selectedFile);
                if (uploadResult.status === "success") {
                    thumbnailUrl = uploadResult.imageUrl;
                } else {
                    alert("Failed to upload image");
                    setUploading(false);
                    return;
                }
            }

            // Update formData with the image URL
            const updatedFormData = { ...formData, thumbnail: thumbnailUrl };

            // Call the original handleSubmit with updated data
            await handleSubmit(e, updatedFormData);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-9 outline-none max-h-[90vh]">
                <div className="overflow-y-auto max-h-[80vh]">
                    <h2 className="text-2xl font-black text-gray-900 mb-5 uppercase tracking-widest">
                        {editingProduct ? "Edit Luxury Item" : "New Collection Addition"}
                    </h2>
                    <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Product Title</label>
                            <input
                                required name="title" value={formData.title} onChange={handleFormChange}
                                className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Description</label>
                            <textarea
                                required name="description" value={formData.description} onChange={handleFormChange} rows="3"
                                className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Sale Price ($)</label>
                            <input
                                required type="number" step="0.01" name="price" value={formData.price} onChange={handleFormChange}
                                className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Old Price ($)</label>
                            <input
                                type="number" step="0.01" name="old_price" value={formData.old_price} onChange={handleFormChange}
                                className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Stock Units</label>
                            <input
                                required type="number" name="stock" value={formData.stock} onChange={handleFormChange}
                                className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Category</label>
                            <select
                                required name="category" value={formData.category} onChange={handleFormChange}
                                className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Product Image</label>
                            <input
                                type="file" accept="image/*" onChange={handleFileChange}
                                className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {selectedFile && (
                                <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>
                            )}
                        </div>
                        <div className="col-span-2 pt-4">
                            <button
                                disabled={uploading}
                                className="w-full py-4 bg-gray-900 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? "Uploading..." : (editingProduct ? "Update Product" : "Launch Product")}
                            </button>
                        </div>
                    </form>

                </div>

            </Box>
        </Modal>
    );
};

export default ProductModal;
