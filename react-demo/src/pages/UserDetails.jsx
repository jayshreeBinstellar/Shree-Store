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
import PaymentModal from "../component/PaymentModal";
import UserProfileSidebar from "../component/UserProfileSidebar";
import UserStatsCards from "../component/UserStatsCards";
import UserTabs from "../component/UserTabs";
import UserOrdersTab from "../component/UserOrdersTab";
import UserWishlistTab from "../component/UserWishlistTab";
import { getProfile, getOrders, getWishlist } from "../services/UserService";


import { useShop } from "../context/ShopContext";

const UserDetails = () => {
    const { openDetails, toggleLike, openCart } = useShop();
    const { cart } = useCart();

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orderHistory, setOrderHistory] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    // Invoice Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const userData = await getProfile();
                if (userData.status === "success") {
                    setUser(userData.user);
                }

                const orderData = await getOrders();
                if (orderData.status === "success") {
                    setOrderHistory(orderData.orders.map(order => ({
                        id: `#ORD-${order.order_id}`,
                        date: new Date(order.created_at).toLocaleDateString(),
                        status: order.status,
                        total: `$${order.total_amount}`,
                        items: order.items || [],
                        raw: order
                    })));
                }

                const wishlistData = await getWishlist();
                if (wishlistData.status === "success") {
                    setWishlist(wishlistData.wishlist);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
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

    if (!user) return null;

    return (
        <div className="bg-[#f8fafc] min-h-screen py-10 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT PANEL */}
                    <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
                        <UserProfileSidebar user={user} handleLogout={handleLogout} />
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="w-full lg:w-2/3 space-y-8">
                        <UserStatsCards
                            wishlistCount={wishlist.length}
                            cartCount={cart.length}
                            setActiveTab={setActiveTab}
                            openCart={openCart}
                        />

                        <UserTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === "orders" && (
                                <UserOrdersTab
                                    orderHistory={orderHistory}
                                    openDetails={openDetails}
                                    handleOpenInvoice={handleOpenInvoice}
                                    navigate={navigate}
                                />
                            )}

                            {activeTab === "wishlist" && (
                                <UserWishlistTab
                                    wishlist={wishlist}
                                    setWishlist={setWishlist}
                                    toggleLike={toggleLike}
                                    openDetails={openDetails}
                                />
                            )}

                            {activeTab === "addresses" && <AddressManager />}
                        </div>
                    </div>
                </div>
            </div>

            <PaymentModal open={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} order={selectedOrder} />
        </div>
    );
};

export default UserDetails;
