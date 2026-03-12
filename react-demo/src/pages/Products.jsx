import React, { useMemo, useState, useEffect, useCallback } from "react";
import ProductDiscovery from "../component/ProductDiscovery";
import BannerCarousel from "../component/BannerCarousel";
import CategoryFilter from "../component/CategoryFilter";
import { CircularProgress } from "@mui/material";
import { getProducts, getCategories, getBanners } from "../services/ShopService";
import { useShop } from "../context/ShopContext";


const PAGE_SIZE = 12;

const Products = () => {
    // Context
    const { searchTerm, openDetails, liked, toggleLike } = useShop();

    // State
    const [productsList, setProductsList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);

    // Initial Metadata Fetch
    useEffect(() => {
        let isMounted = true;

        const fetchMetadata = async () => {
            try {
                setCategoryLoading(true);
                const [catData, bannerData] = await Promise.all([
                    getCategories(),
                    getBanners()
                ]);

                if (isMounted) {
                    if (catData.status === "success" && Array.isArray(catData.categories)) {
                        setCategories(catData.categories);
                    }

                    if (bannerData.status === "success") {
                        const productBanners = bannerData.banners.filter(
                            b => b.is_active && b.position === 'products'
                        );
                        setBanners(productBanners);
                    }
                }
            } catch (err) {
                console.error("[Products] Failed to fetch metadata:", err);
            } finally {
                if (isMounted) setCategoryLoading(false);
            }
        };

        fetchMetadata();
        return () => { isMounted = false; };
    }, []);


    //   Fetch products based on selected category

    const fetchProducts = useCallback(async (currentPage = 1, isLoadMore = false) => {
        try {
            if (isLoadMore) setIsLoadMoreLoading(true);
            else setLoading(true);

            let query = `page=${currentPage}&limit=${PAGE_SIZE}`;
            if (selectedCategory) {
                query += `&category=${selectedCategory.slug}`;
            }
            if (searchTerm) {
                query += `&search=${encodeURIComponent(searchTerm)}`;
            }
            const data = await getProducts(query);

            if (data.status === "success") {
                setProductsList(prev => isLoadMore ? [...prev, ...data.products] : (data.products || []));
                setTotalPages(data.totalPages || 1);
            }
        } catch (err) {
            console.error("[Products] Failed to fetch products:", err);
        } finally {
            setLoading(false);
            setIsLoadMoreLoading(false);
        }
    }, [selectedCategory, searchTerm]);

    // Handle Category or Search Changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(1);
            fetchProducts(1, false);
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [selectedCategory, searchTerm, fetchProducts]);

    const handleLoadMore = useCallback(() => {
        if (page < totalPages) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProducts(nextPage, true);
        }
    }, [page, totalPages, fetchProducts]);

    // Derived UI State
    const filteredProducts = productsList;
    const showLoading = loading && categoryLoading;
    const bannerVisible = banners.length > 0;

    const scrollToGrid = useCallback(() => {
        const gridElement = document.getElementById("new-arrivals-grid");
        if (gridElement) {
            gridElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    if (showLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <CircularProgress color="inherit" />
            </div>
        );
    }

    return (
        <div className="py-12 bg-white min-h-screen animate-in fade-in duration-500">
            <div className="container mx-auto px-4">
                {/* Banner Carousel */}
                {bannerVisible && (
                    <div className="mb-16">
                        <BannerCarousel banners={banners} />
                    </div>
                )}

                {/* Category Filtering */}
                {!bannerVisible && (
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                        loading={categoryLoading}
                    />
                )}

                {/* Products List */}
                <section className="space-y-16">
                    <ProductDiscovery
                        title={selectedCategory ? `${selectedCategory.name} Catalog` : "Best Sellers"}
                        subtitle={selectedCategory ? `Browse our ${selectedCategory.name} collection` : "Our most loved fresh items this week"}
                        products={selectedCategory ? filteredProducts : filteredProducts.slice(0, 8)}
                        layout={selectedCategory ? "grid" : "slider"}
                        onViewDetails={openDetails}
                        liked={liked}
                        onToggleLike={toggleLike}
                        onExploreAll={!selectedCategory ? scrollToGrid : null}
                    />

                    {!selectedCategory && (
                        <div id="new-arrivals-grid">
                            <div className="border-t border-gray-100 mb-16"></div>
                            <ProductDiscovery
                                title="New Arrivals"
                                subtitle="Freshly stocked and ready for your cart"
                                products={filteredProducts}
                                layout="grid"
                                onViewDetails={openDetails}
                                liked={liked}
                                onToggleLike={toggleLike}
                                onExploreAll={null} // Hide button for grid view
                            />
                        </div>
                    )}
                </section>

                {/* Load More Controller */}
                {page < totalPages && (
                    <div className="mt-20 flex flex-col items-center gap-6">
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoadMoreLoading}
                            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group flex items-center gap-3"
                        >
                            {isLoadMoreLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    loading...
                                </>
                            ) : (
                                <>
                                    Explore More Products
                                    <span className="group-hover:translate-y-1 transition-transform">↓</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <h3 className="text-xl font-bold text-gray-400">No products found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search term</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
