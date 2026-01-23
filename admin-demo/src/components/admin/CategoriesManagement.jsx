import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const CategoriesManagement = ({ categories, onEdit, onDelete, onAddClick }) => {
    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Product Categories</h3>
                <button
                    onClick={onAddClick}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                >
                    Add New Category
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Slug</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Order</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {categories.map((cat) => (
                            <tr key={cat.category_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4 font-bold text-gray-900">{cat.name}</td>
                                <td className="px-8 py-4 text-gray-500 font-medium">{cat.slug}</td>
                                <td className="px-8 py-4 text-gray-500">{cat.sort_order}</td>
                                <td className="px-8 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${cat.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                                        {cat.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-8 py-4 flex gap-2">
                                    <button onClick={() => onEdit(cat)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><PencilSquareIcon className="h-4 w-4" /></button>
                                    <button onClick={() => onDelete(cat.category_id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoriesManagement;
