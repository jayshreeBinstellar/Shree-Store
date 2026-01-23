import React from "react";
import { Modal, Box } from "@mui/material";

const BulkImportModal = ({
    open,
    onClose,
    bulkJson,
    setBulkJson,
    onImport,
    onLoadSample
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white rounded-[40px] shadow-2xl p-0 overflow-hidden outline-none">
                <div className="p-10">
                    <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Bulk Product Import</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Paste your product JSON array here</p>

                    <textarea
                        rows="12"
                        value={bulkJson}
                        onChange={(e) => setBulkJson(e.target.value)}
                        placeholder='[{"title":"New Product","price":10,"stock":100,"category":"Groceries","thumbnail":"..."}]'
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs text-gray-700 mb-6"
                    />

                    <div className="flex gap-4">
                        <button
                            onClick={onLoadSample}
                            className="flex-1 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Load Sample
                        </button>
                        <button
                            onClick={onImport}
                            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                        >
                            Import Collection
                        </button>
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export default BulkImportModal;
