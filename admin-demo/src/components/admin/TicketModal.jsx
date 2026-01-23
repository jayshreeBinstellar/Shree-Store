import React, { useState } from "react";
import { Modal, Box } from "@mui/material";

const TicketModal = ({
    open,
    onClose,
    ticket,
    replyText,
    setReplyText,
    onReply,
    onStatusChange,
    loading
}) => {
    const [selectedStatus, setSelectedStatus] = useState(ticket?.status || 'Open');

    const handleStatusUpdate = () => {
        if (onStatusChange && selectedStatus !== ticket?.status) {
            onStatusChange(selectedStatus);
        }
    };

    const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];

    return (
        <Modal open={open} onClose={onClose}>
            <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-2xl bg-white rounded-[40px] shadow-2xl p-0 overflow-hidden outline-none max-h-[90vh] overflow-y-auto">
                <div className="p-10">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight max-w-xs">{ticket?.subject}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-black text-xl flex-shrink-0">×</button>
                    </div>

                    {/* Ticket Info */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</p>
                            <p className="font-bold text-gray-900">{ticket?.category || 'General'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Priority</p>
                            <p className={`font-bold ${
                                ticket?.priority === 'Urgent' ? 'text-red-600' :
                                ticket?.priority === 'High' ? 'text-orange-600' :
                                ticket?.priority === 'Normal' ? 'text-blue-600' : 'text-green-600'
                            }`}>
                                {ticket?.priority || 'Normal'}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Created</p>
                            <p className="font-bold text-gray-900">{new Date(ticket?.created_at).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Updated</p>
                            <p className="font-bold text-gray-900">{new Date(ticket?.updated_at).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 mb-8">
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">From</p>
                        <p className="font-bold text-gray-900">{ticket?.full_name}</p>
                        <p className="text-sm text-gray-600">{ticket?.email}</p>
                    </div>

                    {/* Message Content */}
                    <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Customer Message</p>
                        <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{ticket?.message}</p>
                    </div>

                    {/* Status Update Section */}
                    <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-6 mb-8">
                        <p className="text-xs font-black text-yellow-700 uppercase tracking-widest mb-4">Update Status</p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {statusOptions.map(status => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${
                                        selectedStatus === status
                                            ? 'bg-yellow-600 text-white'
                                            : 'bg-white text-gray-700 border border-yellow-200 hover:bg-yellow-100'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        {selectedStatus !== ticket?.status && (
                            <button
                                onClick={handleStatusUpdate}
                                disabled={loading}
                                className="w-full py-2 bg-yellow-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-yellow-700 disabled:opacity-50"
                            >
                                {loading ? "Updating..." : "Update Status"}
                            </button>
                        )}
                    </div>

                    {/* Reply Section */}
                    {ticket?.status !== 'Closed' && (
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Add Reply / Resolution</label>
                            <textarea
                                rows="4"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your response to the customer..."
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-900 mb-6 resize-none"
                            />
                            <button
                                onClick={onReply}
                                disabled={loading || !replyText.trim()}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? "Sending..." : "Send Reply"}
                            </button>
                        </div>
                    )}

                    {/* Previous Admin Reply */}
                    {ticket?.admin_reply && (
                        <div className="mt-8 bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Previous Resolution</p>
                            <p className="text-emerald-900 font-medium leading-relaxed whitespace-pre-wrap">{ticket.admin_reply}</p>
                        </div>
                    )}
                </div>
            </Box>
        </Modal>
    );
};

export default TicketModal;
