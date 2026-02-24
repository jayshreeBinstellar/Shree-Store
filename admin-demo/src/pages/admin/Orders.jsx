
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import OrdersManagement from '../../components/admin/OrdersManagement';
import InvoiceModal from '../../components/admin/InvoiceModal';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    const [shippingModalOpen, setShippingModalOpen] = useState(false);
    const [shippingData, setShippingData] = useState({ tracking_number: '', shipping_carrier: '' });
    const [currentOrderForShipping, setCurrentOrderForShipping] = useState(null);

    const fetchOrders = async (page = 1) => {
        try {
            const data = await AdminService.getOrders(page);
            if (data.status === "success") {
                setOrders(data.orders);
                setCurrentPage(data.page || page);
                setTotalPages(data.totalPages || 1);
                setTotalOrders(data.total || 0);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const init = async () => {
        setLoading(true);
        await fetchOrders(1);
        setLoading(false);
    };

    useEffect(() => {
        init();
    }, []);

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            await AdminService.updateOrderStatus(id, status);
            toast.success(`Order status updated to ${status}`);
            fetchOrders(currentPage);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    const handleEditShipping = (order) => {
        setCurrentOrderForShipping(order);
        setShippingData({
            tracking_number: order.tracking_number || '',
            shipping_carrier: order.shipping_carrier || ''
        });
        setShippingModalOpen(true);
    };

    const handleSaveShipping = async (e) => {
        e.preventDefault();
        try {
            await AdminService.updateOrderShipping(currentOrderForShipping.order_id, {
                ...shippingData,
                status: currentOrderForShipping.status === 'Pending' ? 'Shipped' : currentOrderForShipping.status
            });
            toast.success("Shipping details saved");
            setShippingModalOpen(false);
            fetchOrders(currentPage);
        } catch (err) {
            console.error(err);
            toast.error("Failed to save shipping details");
        }
    };

    const handlePageChange = (newPage) => {
        fetchOrders(newPage);
    };

    if (loading) return <Loader />;

    return (
        <>
            <OrdersManagement
                orders={orders}
                onUpdateStatus={handleUpdateOrderStatus}
                onViewInvoice={(order) => { setSelectedOrder(order); setIsInvoiceModalOpen(true); }}
                onEditShipping={handleEditShipping}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={loading}
                totalOrders={totalOrders}
            />
            <InvoiceModal
                open={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)}
                order={selectedOrder}
            />
            {/* Shipping Modal */}
            {shippingModalOpen && (
                <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Shipping Details</h2>
                        <form onSubmit={handleSaveShipping} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Carrier</label>
                                <input
                                    type="text"
                                    value={shippingData.shipping_carrier}
                                    onChange={e => setShippingData({ ...shippingData, shipping_carrier: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-300 placeholder:font-medium"
                                    placeholder="e.g. FedEx, DHL, UPS"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tracking Number</label>
                                <input
                                    type="text"
                                    value={shippingData.tracking_number}
                                    onChange={e => setShippingData({ ...shippingData, tracking_number: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-300 placeholder:font-medium"
                                    placeholder="e.g. 1Z999AA10123456784"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShippingModalOpen(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-light hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                >
                                    Update Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Orders;
