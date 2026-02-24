
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import CategoriesManagement from '../../components/admin/CategoriesManagement';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', slug: '', sort_order: 0, is_active: true });
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            const data = await AdminService.getCategories();
            if (data.status === "success") {
                setCategories(data.categories);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                slug: category.slug,
                sort_order: category.sort_order || 0,
                is_active: category.is_active
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', sort_order: 0, is_active: true });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', sort_order: 0, is_active: true });
    };

    const generateSlug = (name) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'name') {
            setFormData({
                ...formData,
                [name]: value,
                slug: generateSlug(value)
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : (name === 'sort_order' ? parseInt(value) : value)
            });
        }
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        setSubmitting(true);
        try {
            if (editingCategory) {
                await AdminService.updateCategory(editingCategory.category_id, formData);
                toast.success('Category updated successfully');
            } else {
                await AdminService.addCategory(formData);
                toast.success('Category added successfully');
            }
            fetchCategories();
            handleCloseModal();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Delete category?")) return;
        try {
            await AdminService.deleteCategory(id);
            fetchCategories();
        } catch (err) { console.error(err); }
    };

    if (loading) return <Loader />;

    return (
        <>
            <CategoriesManagement
                categories={categories}
                onDelete={handleDeleteCategory}
                onEdit={handleOpenModal}
                onAddClick={() => handleOpenModal()}
            />

            {/* Category Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                    placeholder="e.g., Electronics"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                    placeholder="electronics"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    name="sort_order"
                                    value={formData.sort_order}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleFormChange}
                                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                                />
                                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 cursor-pointer">
                                    Active
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : (editingCategory ? 'Update' : 'Add')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Categories;
