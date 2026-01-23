import React, { useState, cloneElement, useEffect, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "../App.css";
import routes from "../routes";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import Detail from "../pages/Details";
import AddCart from "../pages/AddCart";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
// import AdminDashboard from "../pages/AdminDashboard";
import { getWishlist, addToWishlist, removeFromWishlist } from "../services/UserService";
import { verifyPayment } from "../services/ShopService";

export function Main() {
  const dashboardPages = routes.find((r) => r.layout === "main")?.pages || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount, refreshCart } = useCart();
  const [allowPurchase, setAllowPurchase] = useState(true);

  const { token, isAuthenticated } = useAuth();

  const [liked, setLiked] = useState(() => {
    const saved = localStorage.getItem("likedProducts");
    return saved ? JSON.parse(saved) : {};
  });

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      const data = await getWishlist();
      if (data.status === "success") {
        const wishlistMap = {};
        data.wishlist.forEach(p => {
          wishlistMap[p.product_id] = true;
        });
        setLiked(wishlistMap);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // useEffect(() => {
  //   localStorage.setItem("likedProducts", JSON.stringify(liked));
  // }, [liked]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');
    const success = urlParams.get('success');

    if (success === 'true' && sessionId) {
      // Payment successful - order has been created by webhook
      // Just refresh cart and show success message
      refreshCart();
      window.history.replaceState({}, document.title, window.location.pathname);
      alert(`✓ Payment successful! Your order has been confirmed and stock has been reserved.`);
    }
  }, []);

  const handlePaymentSuccess = async (orderId) => {
    const maxRetries = 3;
    let retryCount = 0;

    const attemptVerification = async () => {
      try {
        console.log(`[Payment Verification] Attempt ${retryCount + 1}/${maxRetries} for Order #${orderId}`);
        
        const result = await verifyPayment({
          orderId: parseInt(orderId),
          paymentId: "STRIPE_PAYMENT", // Stripe session ID would come from webhook
          paymentMethod: "Stripe",
          status: "success"
        });

        if (result.status === "success") {
          console.log("[Payment Verification] ✓ Order verified and stock deducted");
          localStorage.removeItem("cart");
          refreshCart();
          window.history.replaceState({}, document.title, window.location.pathname);
          alert(`✓ Payment successful! Order #${orderId} has been confirmed. Stock has been reserved.`);
        } else {
          throw new Error(result.message || "Verification failed");
        }
      } catch (error) {
        console.error(`[Payment Verification] Error on attempt ${retryCount + 1}:`, error.message);
        retryCount++;

        if (error.message.includes("Insufficient stock") || error.message.includes("stock")) {
          // Stock issue - offer refund/alternatives
          alert(
            `⚠️ Payment received but stock is no longer available.\n\n` +
            `Error: ${error.message}\n\n` +
            `Our team will process a refund within 24-48 hours.\n` +
            `Order #${orderId} | We apologize for the inconvenience.`
          );
          console.log("[Payment Verification] Stock unavailable - refund required for order", orderId);
        } else if (retryCount < maxRetries) {
          // Retry for other errors
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`[Payment Verification] Retrying in ${delay}ms...`);
          setTimeout(attemptVerification, delay);
        } else {
          // Max retries exceeded
          alert(
            `Payment received but order verification timed out.\n\n` +
            `Order #${orderId} is pending verification.\n` +
            `Please contact support if this issue persists.\n\n` +
            `Error: ${error.message}`
          );
          console.error("[Payment Verification] Max retries exceeded for order", orderId);
        }
      }
    };

    attemptVerification();
  };



  const toggleLike = async (id) => {
    const isCurrentlyLiked = !!liked[id];
    setLiked((prev) => ({ ...prev, [id]: !isCurrentlyLiked }));

    if (isAuthenticated && token) {
      try {
        if (!isCurrentlyLiked) {
          await addToWishlist({ productId: id });
        } else {
          await removeFromWishlist(id);
        }
      } catch (err) {
        console.error("Failed to sync wishlist", err);
        setLiked((prev) => ({ ...prev, [id]: isCurrentlyLiked }));
      }
    }
  };

  const openDetails = (id, canPurchase = true) => {
    setSelectedProductId(id);
    setAllowPurchase(canPurchase);
    setIsDetailOpen(true);
  };



  const openCart = () => {
    setIsCartOpen(true);
  };

  return (
    <div className={`flex bg-gray-100 `}>
      <div className={`flex flex-col w-full min-h-screen`}>
        <Navbar onSearch={setSearchTerm} onOpenCart={openCart} cartCount={cartCount} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/main/dashboard" replace />} />
            {dashboardPages.map((page) => {
              const elementWithProps = cloneElement(page.element, {
                searchTerm,
                onViewDetails: openDetails,
                onOpenCart: openCart,
                onCartUpdate: refreshCart,
                liked,
                onToggleLike: toggleLike
              });
              return <Route key={page.path} path={page.path} element={elementWithProps} />;
            })}
            <Route path="/admin" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {/* Global Modals */}
        {isDetailOpen && (
          <Detail
            productId={selectedProductId}
            onClose={() => setIsDetailOpen(false)}
            onCartUpdate={refreshCart}
            allowPurchase={allowPurchase}
            onProductChange={(id) => setSelectedProductId(id)}
          />

        )}

        {isCartOpen && (
          <AddCart
            onClose={() => setIsCartOpen(false)}
            onCartUpdate={refreshCart}
          />
        )}
      </div>
    </div>
  );
}

export default Main;
