import React from "react";
import { PlusIcon, PencilIcon, ArchiveBoxIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import MuiPagination from "../Pagination";
import BASE_URL from "../../api/ApiConstant";

const ProductsManagement = ({
    products,
    onEdit,
    onToggleStatus,
    onDelete,
    onAddClick,
    onBulkClick,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    isLoading = false,
    totalProducts = 0,
}) => {
    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Inventory Control</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage {totalProducts} live products</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onBulkClick}
                        className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-50/50"
                    >
                        Bulk Import
                    </button>
                    <button
                        onClick={onAddClick}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Product
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Price</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Stock</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((p) => (
                            <tr key={p.product_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 p-1">
                                            <img src={
                                                p.thumbnail
                                                    ? p.thumbnail.startsWith("http")
                                                        ? p.thumbnail
                                                        : `${BASE_URL}${p.thumbnail}`
                                                    : "/no-image.png"
                                            } alt="" className="max-w-full max-h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{p.title}</div>
                                            <div className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{p.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-center font-black text-gray-900">${Number(p.price).toFixed(2)}</td>
                                <td className="px-8 py-4 text-center">
                                    <span className={`font-black ${p.stock < 10 ? 'text-rose-500' : 'text-gray-600'}`}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-center">
                                    <button
                                        onClick={() => onToggleStatus(p.product_id, !p.is_active)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${p.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'}`}
                                    >
                                        {p.is_active ? 'Active' : 'Draft'}
                                    </button>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onEdit(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><PencilIcon className="h-4 w-4" /></button>
                                        <button onClick={() => onDelete(p.product_id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><ArchiveBoxIcon className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-medium italic">No interactive products found in collection.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <MuiPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    isLoading={isLoading}
                    itemsTotal={totalProducts}
                />
            )}
        </div>
    );
};

export default ProductsManagement;
