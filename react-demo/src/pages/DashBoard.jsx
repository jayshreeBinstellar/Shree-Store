import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ShoppingCartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import ProductCard from "../component/ProductCard";
import FilterSidebar from "../component/FilterSidebar";
import ProductSkeleton from "../component/ProductSkeleton";
import BannerCarousel from "../component/BannerCarousel";
import { getProducts, getBanners, getCategories } from "../services/ShopService";

// Constants
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 500;

/**
 * DashBoard Component
 * Main landing page for authenticated users, showing featured products, categories, and banners.
 */
const DashBoard = ({ onOpenCart }) => {
    // Context
    const { openDetails, liked, toggleLike } = useShop();
    const { cart } = useCart();

    // State
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [filters, setFilters] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    /**
     * Fetch Initial Metadata (Banners, Categories)
     */
    useEffect(() => {
        let isMounted = true;

        const fetchMetadata = async () => {
            try {
                const [bannerData, catData] = await Promise.all([
                    getBanners(),
                    getCategories()
                ]);

                if (isMounted) {
                    if (bannerData.status === "success") {
                        const activeHomepageBanners = bannerData.banners.filter(
                            b => b.is_active && b.position === 'homepage'
                        );
                        setBanners(activeHomepageBanners);
                    }

                    if (catData.status === "success") {
                        setCategories(catData.categories.map(c => c.name));
                    }
                }
            } catch (e) {
                console.error("[DashBoard] Metadata fetch failed:", e);
            }
        };

        fetchMetadata();
        return () => { isMounted = false; };
    }, []);

    /**
     * Primary Product Acquisition Function
     */
    const fetchProducts = useCallback(async (
        currentPage,
        currentFilters = filters,
        currentSearch = searchTerm,
        isLoadMore = false
    ) => {
        try {
            if (!isLoadMore) setLoading(true);

            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: PAGE_SIZE,
                search: currentSearch,
                ...currentFilters
            });

            const data = await getProducts(queryParams.toString());

            if (data.status === "success") {
                setProducts(prev => isLoadMore ? [...prev, ...data.products] : (data.products || []));
                setTotalItems(data.total || 0);
                setHasMore(data.page < data.totalPages);
            }
        } catch (err) {
            console.error("[DashBoard] Product fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }, [filters, searchTerm]);

    /**
     * Debounced Effect for Search and Filter Updates
     */
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts(1, filters, searchTerm, false);
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters, fetchProducts]);

    /**
     * Event Handlers
     */
    const handleLoadMore = useCallback(() => {
        if (loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, filters, searchTerm, true);
    }, [page, filters, searchTerm, fetchProducts, loading]);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({});
        setSearchTerm("");
    }, []);

    // Derived State
    const cartItemCount = cart.length;

    return (
        <div className="relative bg-white min-h-screen animate-in fade-in duration-300">
            {/* Hero Section */}
            <header className="container mx-auto px-4 pt-6">
                <BannerCarousel banners={banners} />
            </header>

            <div className="container mx-auto px-4 pt-12 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar / Filters */}
                    <aside className="lg:w-1/4 space-y-6">
                        <div className="relative group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none font-medium shadow-sm transition-all"
                            />
                        </div>
                        <FilterSidebar onFilterChange={handleFilterChange} categories={categories} />
                    </aside>

                    {/* Product Grid Area */}
                    <main className="lg:w-3/4">
                        {/* Area Header */}
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Discover Products</h2>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{totalItems} Results Available</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    className="relative cursor-pointer group active:scale-90 transition-transform"
                                    onClick={onOpenCart}
                                    aria-label="Open Cart"
                                >
                                    <div className="p-3 bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">
                                        <ShoppingCartIcon className="h-6 w-6 text-white" />
                                    </div>
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-xl animate-bounce-subtle">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Adaptive Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {loading && page === 1 ? (
                                Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <ProductCard
                                        key={product.product_id}
                                        product={product}
                                        isLiked={!!liked[product.product_id]}
                                        onToggleLike={toggleLike}
                                        onViewDetails={openDetails}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <div className="text-6xl mb-4 grayscale opacity-20">🔍</div>
                                    <h3 className="text-gray-900 font-black text-xl mb-2">No matches found</h3>
                                    <p className="text-gray-500 font-medium max-w-xs mx-auto mb-6">We couldn't find any products matching your current search or filters.</p>
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-6 py-2 bg-white border-2 border-indigo-600 text-indigo-600 font-black rounded-xl hover:bg-indigo-50 transition-colors"
                                    >
                                        Clear Search & Filters
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Load More Controller */}
                        {hasMore && (
                            <div className="mt-16 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Loading...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Load More Products
                                            <span className="group-hover:translate-y-1 transition-transform">↓</span>
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashBoard;
