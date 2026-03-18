import React from "react";

const SettingsPortal = ({ settings, setSettings, onUpdateSettings }) => {
    if (!settings) return null;

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">General Settings</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configure your online storefront</p>
                </div>
                <button
                    onClick={onUpdateSettings}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                    Save Changes
                </button>
            </div>
            <form className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Store Name</label>
                    <input
                        type="text" value={settings.store_name}
                        onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900"
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Tax Percentage (%)</label>
                    <input
                        type="number" step="0.01" value={settings.tax_percent}
                        onChange={(e) => setSettings({ ...settings, tax_percent: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900"
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Support Email</label>
                    <input
                        type="email" value={settings.contact_email}
                        onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900"
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Support Phone</label>
                    <input
                        type="text" value={settings.contact_phone}
                        onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Office Address</label>
                    <textarea
                        rows="3" value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900"
                    />
                </div>
            </form>
        </div>
    );
};

export default SettingsPortal;
