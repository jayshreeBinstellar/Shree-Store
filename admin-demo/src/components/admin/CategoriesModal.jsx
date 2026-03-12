import React, { useState, useEffect } from 'react';
// import { Switch } from '@headlessui/react';
import Modal from '../common/Modal';
import * as AdminService from '../../services/AdminService';
import { toast } from 'react-hot-toast';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Checkbox from '@mui/material/Checkbox';

const CategoriesModal = ({ category: editingCategory, onSave, onClose, isOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sort_order: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = !!editingCategory;

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        setFormData({
          name: editingCategory.name || '',
          slug: editingCategory.slug || '',
          sort_order: editingCategory.sort_order || 0,
          is_active: editingCategory.is_active !== false // default true
        });
        setErrors({});
      } else {
        setFormData({
          name: '',
          slug: '',
          sort_order: 0,
          is_active: true
        });
        setErrors({});
      }
    }
  }, [isOpen, editingCategory, isEdit]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: prev.slug || generateSlug(value)
    }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let response;
      if (isEdit) {
        response = await AdminService.updateCategory(editingCategory.category_id, formData);
        toast.success('Category updated successfully');

      } else {
        response = await AdminService.addCategory(formData);
        toast.success('Category added successfully');
      }
      if (response.statusCode === 200 || response.statusCode === 201) {
        onSave?.();
        onClose();
      }
    } catch (error) {
      console.error('Category save error:', error);
      toast.error(isEdit ? 'Failed to update category' : 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl rounded-[40px] " title={isEdit ? "Edit Category" : "New Category"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
            Category Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl font-medium text-gray-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all ${errors.name ? 'border-red-200 focus:border-red-300 focus:ring-red-100' : 'border-gray-100 hover:border-gray-200'
              }`}
            placeholder="Enter category name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
            Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, slug: e.target.value }));
              if (errors.slug) setErrors(prev => ({ ...prev, slug: '' }));
            }}
            className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl font-mono text-sm font-medium text-gray-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all ${errors.slug ? 'border-red-200 focus:border-red-300 focus:ring-red-100' : 'border-gray-100 hover:border-gray-200'
              }`}
            placeholder="auto-generated from name"
          />
          {errors.slug && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.slug}</p>
          )}
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
            Sort Order
          </label>
          <input
            type="number"
            min="0"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            placeholder="0"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
            Status
          </label>
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <span className="text-sm font-medium text-gray-900">Active</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />

              <div
                className={`${formData.is_active ? "bg-emerald-600" : "bg-gray-200"
                  } w-11 h-6 rounded-full transition-colors duration-200`}
              ></div>

              <span
                className={`${formData.is_active ? "translate-x-5" : "translate-x-0"
                  } absolute left-0.5 top-0.5 h-5 w-5 bg-white rounded-full shadow transform transition duration-200`}
              ></span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-black py-4 px-6 rounded-2xl uppercase text-xs tracking-wider border border-gray-200 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black py-4 px-6 rounded-2xl uppercase text-xs tracking-wider shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoriesModal;

