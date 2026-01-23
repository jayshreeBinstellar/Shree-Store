import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ShoppingCartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// import { CircularProgress } from "@mui/material";
import { useCart } from "../context/CartContext";
import ProductCard from "../component/ProductCard";
import FilterSidebar from "../component/FilterSidebar";
import ProductSkeleton from "../component/ProductSkeleton";
import BannerCarousel from "../component/BannerCarousel";
import { getProducts, getBanners, getCategories } from "../services/ShopService";

const PAGE_SIZE = 10;

const DashBoard = ({ onViewDetails, onOpenCart, liked, onToggleLike }) => {
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [filters, setFilters] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    const { cart } = useCart();

    // Fetch Banners and Categories on Mount
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const bannerData = await getBanners();
                if (bannerData.status === "success") {
                    // Filter only active banners for homepage
                    const activeHomepageBanners = bannerData.banners.filter(
                        b => b.is_active && b.position === 'homepage'
                    );
                    setBanners(activeHomepageBanners);
                }

                const catData = await getCategories();
                if (catData.status === "success") {
                    setCategories(catData.categories.map(c => c.name));
                }
            } catch (e) { console.error(e); }
        };
        fetchMetadata();
    }, []);

    const fetchProducts = useCallback(async (currentPage, currentFilters = filters, currentSearch = searchTerm, isLoadMore = false) => {
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
                if (isLoadMore) {
                    setProducts(prev => [...prev, ...data.products]);
                } else {
                    setProducts(data.products || []);
                }
                setTotalItems(data.total || 0);
                setHasMore(data.page < data.totalPages);
            }
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    }, [filters, searchTerm]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts(1, filters, searchTerm, false);
            setPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, filters, searchTerm, true);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className="relative bg-white min-h-screen">
            {/* HERO SECTION - BANNER CAROUSEL */}
            <div className="container mx-auto px-4 pt-6">
                <BannerCarousel banners={banners} />
            </div>

            <div className="container mx-auto px-4 pt-12 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-1/4">
                        <div className="relative mb-6">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium shadow-sm"
                            />
                        </div>
                        <FilterSidebar onFilterChange={handleFilterChange} categories={categories} />
                    </aside>

                    {/* Product Grid Area */}
                    <main className="lg:w-3/4">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">All Products</h2>
                                <p className="text-gray-500 text-sm">{totalItems} products found</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative cursor-pointer group" onClick={onOpenCart}>
                                    <div className="p-3 bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">
                                        <ShoppingCartIcon className="h-6 w-6 text-white" />
                                    </div>
                                    {cart.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-md">
                                            {cart.length}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {loading && page === 1 ? (
                                [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <ProductCard
                                        key={product.product_id}
                                        product={product}
                                        isLiked={!!liked[product.product_id]}
                                        onToggleLike={onToggleLike}
                                        onViewDetails={onViewDetails}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <div className="text-5xl mb-4 opacity-30">🔍</div>
                                    <p className="text-gray-500 font-bold">No products found matching your criteria</p>
                                    <button
                                        onClick={() => { setFilters({}); setSearchTerm(""); }}
                                        className="mt-4 text-indigo-600 font-bold hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>


                        {hasMore && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? "Loading..." : "Load More Products"}
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
