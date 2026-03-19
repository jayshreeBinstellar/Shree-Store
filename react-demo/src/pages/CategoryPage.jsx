import React, { useEffect, useState, useCallback, useMemo } from "react";
import ProductDiscovery from "../component/ProductDiscovery";
import ProductCard from "../component/ProductCard";
import BannerCarousel from "../component/BannerCarousel";
import { CircularProgress } from "@mui/material";
import { getProducts, getBanners } from "../services/ShopService";
import { useShop } from "../context/ShopContext";

// Constants
const INITIAL_PAGE_SIZE = 10;
const LOAD_MORE_INCREMENT = 10;


const CategoryPage = ({
    category,
    title,
    subCategories,
    routeName
}) => {
    // Context hooks
    const { searchTerm, openDetails, liked, toggleLike } = useShop();

    // Local state
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
    const [activeSegment, setActiveSegment] = useState("all");

    const segments = useMemo(() => {
        if (routeName !== "fashion") return [];
        return [
            { id: "all", name: "Explore All" },
            { id: "men", name: "Men's Wear" },
            { id: "women", name: "Women's Wear" }
        ];
    }, [routeName]);


    const fetchCategoryProducts = useCallback(async () => {
        let isMounted = true;
        try {
            setLoading(true);
            const catQuery = Array.isArray(category) ? category.join(',') : category;

            // Limit increased to allow for sub-category distribution
            const data = await getProducts(`category=${catQuery}&limit=200`);

            if (isMounted && data.status === "success") {
                setProducts(data.products || []);
                setVisibleCount(INITIAL_PAGE_SIZE);
            }
        } catch (err) {
            console.error(`[CategoryPage] Failed to fetch ${title} products:`, err);
        } finally {
            if (isMounted) setLoading(false);
        }
        return () => { isMounted = false; };
    }, [category, title]);

    const fetchRouteBanners = useCallback(async () => {
        let isMounted = true;
        try {
            const bannerData = await getBanners();
            if (isMounted && bannerData.status === "success") {
                const routeBanners = bannerData.banners.filter(
                    b => b.is_active && (
                        b.position === routeName ||
                        b.position === 'category'
                    )
                );
                setBanners(routeBanners);
            }
        } catch (err) {
            console.error("[CategoryPage] Failed to fetch banners:", err);
        }
        return () => { isMounted = false; };
    }, [routeName]);

    // Effects
    useEffect(() => {
        fetchCategoryProducts();
    }, [fetchCategoryProducts]);

    useEffect(() => {
        fetchRouteBanners();
    }, [fetchRouteBanners]);

    const filteredProducts = useMemo(() => {
        let list = products;

        if (activeSegment !== "all") {
            // Find relevant sub-category definition to use its keys for precise filtering
            const relevantSub = subCategories?.find(sub =>
                sub.name.toLowerCase().includes(activeSegment)
            );

            if (relevantSub) {
                list = list.filter(p => {
                    const prodCat = p.category?.toLowerCase() || "";
                    return relevantSub.keys.some(k => prodCat === k.toLowerCase());
                });
            } else {
                // Precise fallback matching
                list = list.filter(p => {
                    const cat = p.category?.toLowerCase() || "";
                    const title = p.title?.toLowerCase() || "";
                    if (activeSegment === "men") {
                        return cat.includes("mens") || (title.includes("men") && !title.includes("women"));
                    }
                    if (activeSegment === "women") {
                        return cat.includes("womens") || title.includes("women") || cat === "tops";
                    }
                    return true;
                });
            }
        }

        const term = searchTerm?.toLowerCase().trim();
        if (!term) return list;
        return list.filter(p => p.title?.toLowerCase().includes(term));
    }, [products, searchTerm, activeSegment, subCategories]);

    const handleLoadMore = useCallback(() => {
        setVisibleCount(prev => prev + LOAD_MORE_INCREMENT);
    }, []);

    const handleShowLess = useCallback(() => {
        setVisibleCount(INITIAL_PAGE_SIZE);
    }, []);

    const scrollToGrid = useCallback(() => {
        const gridElement = document.getElementById("explore-all-grid");
        if (gridElement) {
            gridElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    // Early return for loading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <CircularProgress color="inherit" />
            </div>
        );
    }

    return (
        <div className="py-12 bg-white min-h-screen animate-in fade-in duration-300">
            <div className="container mx-auto px-4">
                {/* Banners */}
                {banners.length > 0 && (
                    <section className="mb-16">
                        <BannerCarousel banners={banners} />
                    </section>
                )}

                {/* Structured Sub-categories */}
                {subCategories?.length > 0 && !searchTerm && (
                    <section className="space-y-20 mb-10 border-b border-gray-100 pb-20">
                        {subCategories.map((sub) => {
                            // Filter sections based on active segment
                            if (routeName === "fashion" && activeSegment !== "all") {
                                if (activeSegment === "men" && !sub.name.toLowerCase().includes("men")) return null;
                                if (activeSegment === "women" && !sub.name.toLowerCase().includes("women")) return null;
                            }

                            const subProducts = products.filter(p => {
                                const catMatch = sub.keys.some(k => p.category?.toLowerCase() === k.toLowerCase());
                                if (!catMatch) return false;

                                if (sub.include?.length > 0) {
                                    return sub.include.some(word => p.title?.toLowerCase().includes(word.toLowerCase()));
                                }
                                if (sub.exclude?.length > 0) {
                                    return !sub.exclude.some(word => p.title?.toLowerCase().includes(word.toLowerCase()));
                                }
                                if (sub.gender === 'kids') {
                                    const titleLower = p.title?.toLowerCase() || "";
                                    return titleLower.includes('kids') || titleLower.includes('child') || titleLower.includes('baby');
                                }
                                return true;
                            });

                            if (subProducts.length === 0) return null;

                            return (
                                <ProductDiscovery
                                    key={sub.name}
                                    title={sub.name}
                                    subtitle={sub.subtitle}
                                    products={subProducts}
                                    layout="slider"
                                    onViewDetails={openDetails}
                                    liked={liked}
                                    onToggleLike={toggleLike}
                                    onExploreAll={scrollToGrid}
                                />
                            );
                        })}
                    </section>
                )}

                
                {/* Segment Filter */}
                {segments.length > 0 && (
                    <div className="flex justify-center mb-8 animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-gray-50 border border-gray-100 p-2 rounded-4xl flex gap-2 shadow-sm">
                            {segments.map((seg) => (
                                <button
                                    key={seg.id}
                                    onClick={() => {
                                        setActiveSegment(seg.id);
                                        setVisibleCount(INITIAL_PAGE_SIZE);
                                    }}
                                    className={`px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${activeSegment === seg.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105" : "text-gray-400 hover:text-gray-900 hover:bg-white"}`}
                                >
                                    {seg.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}


                {/* Comprehensive Grid Section */}
                <section className="mt-12 space-y-8" id="explore-all-grid">
                    <header className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                {searchTerm
                                    ? `Search: "${searchTerm}"`
                                    : activeSegment !== "all"
                                        ? segments.find(s => s.id === activeSegment)?.name
                                        : `All ${title} Items`
                                }
                            </h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {filteredProducts.length} curated products
                            </p>
                        </div>
                    </header>

                    {filteredProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredProducts.slice(0, visibleCount).map((product) => (
                                    <ProductCard
                                        key={product.product_id}
                                        product={product}
                                        isLiked={!!liked[product.product_id]}
                                        onViewDetails={openDetails}
                                        onToggleLike={toggleLike}
                                    />
                                ))}
                            </div>

                            {/* Pagination Interface */}
                            <footer className="flex flex-col items-center gap-8 mt-16 pb-10">
                                <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                                <div className="flex items-center gap-4">
                                    {visibleCount < filteredProducts.length && (
                                        <button
                                            onClick={handleLoadMore}
                                            className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            Show More Items
                                            <span>↓</span>
                                        </button>
                                    )}
                                    {visibleCount > INITIAL_PAGE_SIZE && (
                                        <button
                                            onClick={handleShowLess}
                                            className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            Collapse View
                                            <span>↑</span>
                                        </button>
                                    )}
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="text-center py-24 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                            <div className="text-6xl mb-4 grayscale opacity-20">📦</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Portfolio Empty</h3>
                            <p className="text-gray-500 text-sm font-medium">
                                {searchTerm ? `No results for "${searchTerm}" in this category.` : `We're currently stocking up on new ${title} items.`}
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CategoryPage;
