import React, { createContext, useContext, useState, useEffect } from "react";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../services/ShopService";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { isAuthenticated, token } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCart = async () => {
        if (!isAuthenticated || !token) {
            setCart([]);
            return;
        }
        setLoading(true);
        try {
            const data = await getCart();
            if (data.status === "success") {
                setCart(data.cart);
            }
        } catch (err) {
            console.error("Failed to fetch cart", err);
            setError("Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated, token]);

    const addItem = async (productId, quantity = 1) => {
        if (!isAuthenticated) {
            toast.error("Please login to add items to cart");
            return;
        }
        try {
            await addToCart(productId, quantity);
            await fetchCart();
            toast.success("Added to cart!");
            return { status: 'success' };
        } catch (err) {
            console.error("Failed to add to cart", err);
            const msg = err.response?.data?.message || "Failed to add to cart";
            toast.error(msg);
            return { status: 'error', message: msg };
        }
    };

    const updateItem = async (productId, quantity) => {
        try {
            await updateCartItem(productId, quantity);
            await fetchCart();
        } catch (err) {
            console.error("Failed to update cart", err);
        }
    };

    const removeItem = async (productId) => {
        try {
            await removeFromCart(productId);
            await fetchCart();
        } catch (err) {
            console.error("Failed to remove from cart", err);
        }
    };


    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

    return (
        <CartContext.Provider value={{ cart, loading, error, addItem, updateItem, removeItem, cartCount, refreshCart: fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};
