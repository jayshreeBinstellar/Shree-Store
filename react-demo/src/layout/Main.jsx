import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "../App.css";
import routes from "../routes";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import Detail from "../pages/Details";
import AddCart from "../pages/AddCart";

import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";

import { ProtectedRoute } from "../context/ProtectedRoute";

import { toast } from "react-hot-toast";

export function Main() {
  const dashboardPages = routes.find((r) => r.layout === "main")?.pages || [];
  const { cartCount, refreshCart } = useCart();
  const {
    isDetailOpen,
    closeDetails,
    selectedProductId,
    setSelectedProductId,
    allowPurchase
  } = useShop();

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');
    const success = urlParams.get('success');

    if (success === 'true' && sessionId) {
      refreshCart();
      window.history.replaceState({}, document.title, window.location.pathname);
      toast.success(`Payment successful! Your order has been confirmed.`);
    }
  }, []);

  const openCart = () => {
    setIsCartOpen(true);
  };

  return (
    <div className={`flex bg-gray-100 `}>
      <div className={`flex flex-col w-full min-h-screen`}>
        <Navbar onOpenCart={openCart} cartCount={cartCount} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/main/dashboard" replace />} />
            {dashboardPages.map((page) => {
              const isProtected = ["account", "support", "payment-success"].includes(page.name);
              return (
                <Route
                  key={page.path}
                  path={page.path}
                  element={
                    isProtected ? (
                      <ProtectedRoute>{page.element}</ProtectedRoute>
                    ) : (
                      page.element
                    )
                  }
                />
              );
            })}
            <Route path="/admin" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {/* Global Modals */}
        {isDetailOpen && <Detail />}

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
