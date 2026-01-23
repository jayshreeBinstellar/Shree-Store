import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

const ShippingZones = ({ zones, onAddClick }) => {
    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Shipping Zones</h3>
                <button
                    onClick={onAddClick}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                >
                    Add New Zone
                </button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {zones.map((zone) => (
                    <div key={zone.zone_id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center hover:bg-white transition-colors duration-300">
                        <div>
                            <h4 className="font-bold text-gray-900">{zone.name}</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{zone.city}, {zone.state}</p>
                            <p className="text-[10px] font-black text-indigo-600 mt-2 uppercase tracking-tighter">Flat Rate: $15.00</p>
                        </div>
                    </div>
                ))}
                {zones.length === 0 && (
                    <div className="col-span-3 py-20 text-center text-gray-400 font-medium italic">No shipping zones configured yet.</div>
                )}
            </div>
        </div>
    );
};

export default ShippingZones;
