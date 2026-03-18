import React from 'react';
import { Link } from "react-router-dom";

const CartAddressSelector = ({ addresses, selectedAddress, setSelectedAddress }) => {
    if (!localStorage.getItem("token")) return null;

    return (
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Shipping To</span>
                <Link to="/main/account" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline italic">Edit</Link>
            </div>
            {addresses.length > 0 ? (
                <select
                    className="w-full bg-gray-50 border border-transparent rounded-lg p-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedAddress || ""}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                >
                    {addresses.map(addr => (
                        <option key={addr.address_id} value={addr.address_id}>
                            {addr.type}: {addr.street_address.substring(0, 20)}...
                        </option>
                    ))}
                </select>
            ) : (
                <div className="text-[10px] text-gray-400 font-medium italic">
                    No addresses found. <Link to="/main/account" className="text-indigo-600 font-bold hover:underline">Add one</Link>
                </div>
            )}
        </div>
    );
};

export default CartAddressSelector;
