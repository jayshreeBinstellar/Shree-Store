import React, { useState } from 'react';
import { PencilSquareIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const ShippingOptionsManagement = ({ options, onAdd, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentOption, setCurrentOption] = useState({ name: '', cost: '', estimated_days: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentOption.shipping_id) {
            onUpdate(currentOption.shipping_id, currentOption);
        } else {
            onAdd(currentOption);
        }
        setIsEditing(false);
        setCurrentOption({ name: '', cost: '', estimated_days: '' });
    };

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Shipping Options</h3>
                <button
                    onClick={() => { setIsEditing(true); setCurrentOption({ name: '', cost: '', estimated_days: '' }); }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all"
                >
                    <PlusIcon className="w-4 h-4" /> Add Option
                </button>
            </div>

            {isEditing && (
                <div className="p-6 ">
                    <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Name</label>
                            <input
                                type="text"
                                value={currentOption.name}
                                onChange={e => setCurrentOption({ ...currentOption, name: e.target.value })}
                                className="w-full p-2 rounded-lg border border-gray-200 text-sm font-bold"
                                placeholder="e.g. Standard Delivery"
                                required
                            />
                        </div>
                        <div className="w-32">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Cost ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={currentOption.cost}
                                onChange={e => setCurrentOption({ ...currentOption, cost: e.target.value })}
                                className="w-full p-2 rounded-lg border border-gray-200 text-sm font-bold"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="w-48">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Days</label>
                            <input
                                type="text"
                                value={currentOption.estimated_days}
                                onChange={e => setCurrentOption({ ...currentOption, estimated_days: e.target.value })}
                                className="w-full p-2 rounded-lg border border-gray-200 text-sm font-bold"
                                placeholder="e.g. 3-5 Days"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Save</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Cost</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Est. Days</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {options.map((option) => (
                            <tr key={option.shipping_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4 font-bold text-gray-900">{option.name}</td>
                                <td className="px-8 py-4 font-black text-indigo-600">${parseFloat(option.cost).toFixed(2)}</td>
                                <td className="px-8 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">{option.estimated_days}</td>
                                <td className="px-8 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => { setIsEditing(true); setCurrentOption(option); }}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            <PencilSquareIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(option.shipping_id)}
                                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
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

export default ShippingOptionsManagement;
