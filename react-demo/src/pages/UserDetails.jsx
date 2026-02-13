import React from "react";
import { useCart } from "../context/CartContext";
import {
    UserIcon,
    ShoppingBagIcon,
    HeartIcon,
    ClockIcon,
    MapPinIcon,
    ShieldCheckIcon,
    ArrowLeftStartOnRectangleIcon
} from "@heroicons/react/24/outline";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddressManager from "../component/AddressManager";
import OrderStatusTimeline from "../component/OrderStatusTimeline";
import PaymentModal from "../component/PaymentModal";
import { getProfile, getOrders, getWishlist } from "../services/UserService";


const UserDetails = ({ liked = {}, onToggleLike, onViewDetails, onOpenCart }) => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);
    const { cart } = useCart();

    // Invoice Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/"); // Redirect to home or login if no token
                return;
            }

            try {
                // Fetch User Profile
                const userData = await getProfile();
                if (userData.status === "success") {
                    setUser(userData.user);
                }

                // Fetch Order History
                const orderData = await getOrders();
                if (orderData.status === "success") {
                    setOrderHistory(orderData.orders.map(order => ({
                        id: `#ORD-${order.order_id}`,
                        date: new Date(order.created_at).toLocaleDateString(),
                        status: order.status,
                        total: `$${order.total_amount}`,
                        items: order.items || [],
                        raw: order // Store full object for invoice
                    })));
                }

                // Fetch Wishlist
                const wishlistData = await getWishlist();
                if (wishlistData.status === "success") {
                    setWishlist(wishlistData.wishlist);
                }
            } catch (error) {

                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
    };

    const [activeTab, setActiveTab] = useState("orders");

    const handleOpenInvoice = (order) => {
        setSelectedOrder(order.raw);
        setIsInvoiceOpen(true);
    };


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
            </div>
        </div>
    );

    if (!user) return null;


    return (
        <div className="bg-[#f8fafc] min-h-screen py-10 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT PANEL - Profile Overview (Sticky) */}
                    <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
                        <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-50 shadow-xl bg-gray-50 flex items-center justify-center">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-indigo-200">{user.full_name?.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-1 bg-indigo-600 text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-all border-4 border-white active:scale-95">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                            </div>

                            <h2 className="mt-6 text-2xl font-black text-gray-900 tracking-tight">{user.full_name}</h2>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">{user.email}</p>

                            <div className="w-full h-px bg-linear-to-r from-transparent via-gray-100 to-transparent my-8"></div>

                            <div className="w-full space-y-5">
                                <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                        <ClockIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Member Since</p>
                                        <p className="text-sm font-black text-gray-800">{new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                                        <MapPinIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gender</p>
                                        <p className="text-sm font-black text-gray-800">{user.gender || "Not Specified"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                        <ShieldCheckIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
                                        <p className="text-sm font-black text-blue-600 italic">Premium Member</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="mt-10 w-full py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200 group"
                            >
                                <ArrowLeftStartOnRectangleIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL - Content Area */}
                    <div className="w-full lg:w-2/3 space-y-8">

                        {/* STATS OVERVIEW */}
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                            <div
                                onClick={() => setActiveTab("wishlist")}
                                className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-indigo-600 transition-all cursor-pointer overflow-hidden relative"
                            >
                                <div className="relative z-10">
                                    <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">Favorites</p>
                                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors mt-1"> {wishlist.length}</h3>
                                </div>
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform relative z-10">
                                    <HeartIcon className="w-6 h-6 md:w-8 md:h-8 fill-rose-500" />
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-rose-50/30 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            </div>
                            <div
                                onClick={onOpenCart}
                                className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-indigo-600 transition-all cursor-pointer overflow-hidden relative"
                            >
                                <div className="relative z-10">
                                    <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">In Basket</p>
                                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors mt-1">{cart.length}</h3>
                                </div>
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform relative z-10">
                                    <ShoppingBagIcon className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50/30 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            </div>
                        </div>

                        {/* TABS NAVIGATION */}
                        <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 flex gap-2">
                            <button
                                onClick={() => setActiveTab("orders")}
                                className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                My Orders
                            </button>
                            <button
                                onClick={() => setActiveTab("wishlist")}
                                className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'wishlist' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                Wishlist
                            </button>
                            <button
                                onClick={() => setActiveTab("addresses")}
                                className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'addresses' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                Addresses
                            </button>
                        </div>

                        {/* TAB CONTENT */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === "orders" ? (
                                <div className="bg-white rounded-[40px] p-6 md:p-10 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black text-gray-900">Recent Purchase</h3>
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                            {orderHistory.length} Total Orders
                                        </span>
                                    </div>

                                    {/* Desktop Table */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-50 text-left">
                                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Details</th>
                                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking Status</th>
                                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {orderHistory.map((order) => (
                                                    <tr key={order.id}
                                                        className="group hover:bg-gray-50/50 transition-all cursor-pointer"
                                                        onClick={() => handleOpenInvoice(order)}
                                                        title="Click to view Invoice"
                                                    >
                                                        <td className="p-4 ">
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-gray-900 mb-2 truncate max-w-37.5">{order.id}</span>
                                                                <span className="text-xs text-gray-400 font-bold mb-4">{order.date}</span>

                                                                {/* Order Products */}
                                                                <div className="flex flex-wrap gap-2">
                                                                    {order.items.map((item, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation(); // Don't trigger modal
                                                                                onViewDetails(item.product_id, order.status?.toLowerCase() === 'delivered')
                                                                            }}
                                                                            className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-1 cursor-pointer hover:border-indigo-600 transition-all hover:scale-110"
                                                                            title={item.title}
                                                                        >
                                                                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className={`flex flex-col ${order.status?.toLowerCase() === 'delivered' ? 'gap-2' : 'gap-1'}`}>
                                                                <span className={`w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                                {order.status?.toLowerCase() !== 'delivered' && (
                                                                    <div className="w-full max-w-87.5 pr-4">
                                                                        <OrderStatusTimeline status={order.status} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 font-black text-gray-900 text-right text-lg">
                                                            {order.total}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="md:hidden space-y-6">
                                        {orderHistory.map((order) => (
                                            <div key={order.id}
                                                className="bg-gray-50 p-6 rounded-3xl border border-gray-100"
                                                onClick={() => handleOpenInvoice(order)}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-black text-gray-900">{order.id}</h4>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{order.date}</p>
                                                    </div>
                                                    <span className="text-lg font-black text-indigo-600">{order.total}</span>
                                                </div>
                                                <div className={`space-y-${order.status?.toLowerCase() === 'delivered' ? '1' : '4'}`}>
                                                    <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {order.status}
                                                    </span>
                                                    {order.status?.toLowerCase() !== 'delivered' && (
                                                        <OrderStatusTimeline status={order.status} />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {orderHistory.length === 0 && (
                                        <div className="text-center py-20 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <ShoppingBagIcon className="w-8 h-8 text-gray-200" />
                                            </div>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No orders placed yet</p>
                                            <button
                                                onClick={() => navigate("/")}
                                                className="mt-6 text-indigo-600 font-black text-sm hover:underline"
                                            >
                                                Start Exploring Products
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === "wishlist" ? (
                                <div className="bg-white rounded-[40px] p-6 md:p-10 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black text-gray-900">My Wishlist</h3>
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                            {wishlist.length} Items Liked
                                        </span>
                                    </div>

                                    {wishlist.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {wishlist.map((product) => (
                                                <div key={product.product_id} className="relative group">
                                                    <div
                                                        onClick={() => onViewDetails(product.product_id)}
                                                        className="aspect-square bg-gray-50 rounded-3xl overflow-hidden mb-3 cursor-pointer p-4 group-hover:shadow-lg transition-all"
                                                    >
                                                        <img
                                                            src={product.thumbnail}
                                                            alt={product.title}
                                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <h4 className="font-black text-gray-900 text-sm truncate">{product.title}</h4>
                                                    <p className="text-indigo-600 font-black text-sm">${product.price}</p>
                                                    <button
                                                        onClick={() => onToggleLike(product.product_id)}
                                                        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-xl text-rose-500 shadow-sm hover:bg-rose-50 transition-colors"
                                                    >
                                                        <HeartIcon className="w-4 h-4 fill-current" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200">
                                            <HeartIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Your wishlist is empty</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <AddressManager />
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* INVOICE MODAL */}
            <PaymentModal
                open={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
                order={selectedOrder}
            />

        </div>
    );
};


export default UserDetails;
