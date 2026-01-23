import React from "react";
import { StarIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

const ReviewsManagement = ({ reviews, onUpdateStatus }) => {
    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Customer Reviews</h3>
                <span className="px-4 py-1.5 bg-yellow-50 text-yellow-600 rounded-full text-xs font-bold uppercase tracking-widest">
                    {reviews.filter(r => r.status === 'Pending').length} Pending Approval
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Rating</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Comment</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {reviews.map((rev) => (
                            <tr key={rev.review_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center p-1 border">
                                            <img src={rev.product_image} alt="" className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-900 truncate w-32">{rev.product_title}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4 font-bold text-gray-700 text-xs">{rev.full_name}</td>
                                <td className="px-8 py-4">
                                    <div className="flex text-yellow-400 items-center">
                                        <StarIcon className="h-4 w-4 fill-current" />
                                        <span className="text-xs font-black ml-1 text-gray-900">{rev.rating}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-xs text-gray-500 max-w-xs truncate">{rev.comment}</td>
                                <td className="px-8 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${rev.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                        rev.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-yellow-50 text-yellow-600'
                                        }`}>
                                        {rev.status}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onUpdateStatus(rev.review_id, 'Approved')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Approve"><CheckCircleIcon className="h-5 w-5" /></button>
                                        <button onClick={() => onUpdateStatus(rev.review_id, 'Rejected')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Reject"><XCircleIcon className="h-5 w-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReviewsManagement;
