import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Modal from "../common/Modal";

const AddCustomerModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        role: "Customer", // Default to Customer as requested
        gender: "Other",
        dob: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await onAdd(formData);
            onClose();
            setFormData({
                fullname: "",
                email: "",
                password: "",
                role: "Customer",
                gender: "Other",
                dob: ""
            });
        } catch (err) {
            setError(err.message || "Failed to add user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
          isOpen={isOpen} 
          onClose={onClose} 
          title="Add New Account"
          className="rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        >
          <form onSubmit={handleSubmit} className="">

                    {error && (
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold uppercase tracking-wider text-center border border-rose-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-2 py-2 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.fullname}
                                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                placeholder="Enter full name"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                            <input
                                required
                                type="email"
                                className="w-full px-2 py-2 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pr-12 px-2 py-2 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                                <span
                                    className="absolute right-4 top-1 cursor-pointer text-gray-400 hover:text-indigo-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Role</label>
                                <select
                                    className="w-full px-2 py-2 bg-gray-50 border border-gray-100 rounded-2xl text-sm  focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Staff">Staff</option>
                                    <option value="Customer">Customer</option>
                                    <option value="Super Admin">Super Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Gender</label>
                                <select
                                    className="w-full px-2 py-2 bg-gray-50 border border-gray-100 rounded-2xl text-sm  focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="Other">Other</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Date of Birth</label>
                            <input
                                type="date"
                                className="w-full px-2 py-2 bg-gray-50 border border-gray-100 rounded-2xl text-sm  focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Account"}
                        </button>
                    </div>
                </form>
          </Modal>
    );
};


export default AddCustomerModal;
