import React, { useState, useEffect } from "react";
import { MapPinIcon, PhoneIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getAddresses, addAddress, deleteAddress } from "../services/UserService";

const AddressManager = () => {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newAddress, setNewAddress] = useState({
        type: "Home",
        fullname: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        isDefault: false
    });

    const token = localStorage.getItem("token");

    const fetchAddresses = async () => {
        try {
            const data = await getAddresses();
            if (data.status === "success") {
                setAddresses(data.addresses);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await addAddress(newAddress);
            if (data.status === "success") {
                setShowForm(false);
                setNewAddress({
                    type: "Home",
                    fullname: "",
                    phone: "",
                    street: "",
                    city: "",
                    state: "",
                    zip: "",
                    isDefault: false
                });
                fetchAddresses();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            await deleteAddress(id);
            fetchAddresses();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-white rounded-[40px] p-6 md:p-10 shadow-sm border border-gray-100">

            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">Manage Addresses</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                >
                    {showForm ? "✕" : <PlusIcon className="w-5 h-5" />}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-50 p-6 rounded-3xl animate-in slide-in-from-top-4 duration-300">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Address Type</label>
                        <div className="flex gap-4">
                            {["Home", "Office", "Other"].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setNewAddress({ ...newAddress, type: t })}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${newAddress.type === t ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white text-gray-500 border border-gray-200"}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newAddress.fullname}
                        onChange={(e) => setNewAddress({ ...newAddress, fullname: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Phone Number"
                        className="p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Street Address"
                        className="md:col-span-2 p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="City"
                        className="p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="State"
                        className="p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="ZIP Code"
                        className="p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newAddress.zip}
                        onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                        required
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        />
                        <span className="text-xs font-bold text-gray-600">Set as default address</span>
                    </div>
                    <button
                        type="submit"
                        className="md:col-span-2 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                    >
                        Save Address
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                    <div key={addr.address_id} className="group relative bg-gray-50 p-6 rounded-[30px] border border-transparent hover:border-indigo-600 transition-all duration-300">
                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                onClick={() => handleDelete(addr.address_id)}
                                className="p-2 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-50"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                <MapPinIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg">
                                        {addr.type}
                                    </span>
                                    {addr.is_default && (
                                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-lg">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-black text-gray-900">{addr.full_name}</h4>
                                <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                                    {addr.street_address},<br />
                                    {addr.city}, {addr.state} - {addr.zip_code}
                                </p>
                                <p className="text-xs text-gray-500 font-bold mt-2 flex gap-1"><PhoneIcon className="h-4 w-4" /> {addr.phone}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {addresses.length === 0 && !showForm && (
                    <div className="col-span-full py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No saved addresses</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressManager;
