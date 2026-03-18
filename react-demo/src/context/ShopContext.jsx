import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from "react";
import { getWishlist, addToWishlist, removeFromWishlist } from "../services/UserService";
import { useAuth } from "./AuthContext";

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [allowPurchase, setAllowPurchase] = useState(true);
    const [liked, setLiked] = useState({});

    const fetchWishlist = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setLiked({});
            return;
        }
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

    const toggleLike = useCallback(async (id) => {
        const isCurrentlyLiked = !!liked[id];

        // Optimistic update
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
                // Rollback if failed
                setLiked((prev) => ({ ...prev, [id]: isCurrentlyLiked }));
            }
        }
    }, [liked, isAuthenticated, token]);

    const [isCartOpen, setIsCartOpen] = useState(false);

    const openDetails = useCallback((id, canPurchase = true) => {
        setSelectedProductId(id);
        setAllowPurchase(canPurchase);
        setIsDetailOpen(true);
    }, []);

    const closeDetails = useCallback(() => {
        setIsDetailOpen(false);
        setSelectedProductId(null);
    }, []);

    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);

    const value = useMemo(() => ({
        searchTerm,
        setSearchTerm,
        selectedProductId,
        setSelectedProductId,
        isDetailOpen,
        setIsDetailOpen,
        isCartOpen,
        setIsCartOpen,
        allowPurchase,
        setAllowPurchase,
        liked,
        toggleLike,
        openDetails,
        closeDetails,
        openCart,
        closeCart
    }), [
        searchTerm,
        selectedProductId,
        isDetailOpen,
        isCartOpen,
        allowPurchase,
        liked,
        toggleLike,
        openDetails,
        closeDetails,
        openCart,
        closeCart
    ]);

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};
