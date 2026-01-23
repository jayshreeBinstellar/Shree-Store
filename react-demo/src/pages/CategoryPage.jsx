import React, { useEffect, useState } from "react";
import ProductDiscovery from "../component/ProductDiscovery";
import ProductCard from "../component/ProductCard";
import BannerCarousel from "../component/BannerCarousel";
import { CircularProgress } from "@mui/material";
import { getProducts, getBanners } from "../services/ShopService";

const PAGE_SIZE = 10;

const CategoryPage = ({ category, title, subtitle, bannerImage, searchTerm, onViewDetails, liked, onToggleLike, subCategories, routeName }) => {
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                setLoading(true);
                const catQuery = Array.isArray(category) ? category.join(',') : category;
                // Fetch a large enough set for this category to populate sliders and grid
                const data = await getProducts(`category=${catQuery}&limit=200`);

                if (data.status === "success") {
                    setProducts(data.products || []);
                    setVisibleCount(PAGE_SIZE);
                }
            } catch (err) {
                console.error(`Failed to fetch ${category} products`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
    }, [category]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const bannerData = await getBanners();
                if (bannerData.status === "success") {
                    // Filter banners for this specific route
                    // routeName will be like 'fashion', 'electronics', 'bag', etc.
                    const routeBanners = bannerData.banners.filter(
                        b => b.is_active && (
                            b.position === routeName || 
                            b.position === 'category'
                        )
                    );
                    setBanners(routeBanners);
                }
            } catch (err) {
                console.error("Failed to fetch category banners", err);
            }
        };
        fetchBanners();
    }, [routeName]);

    const filteredProducts = products.filter(p =>
        p.title?.toLowerCase().includes(searchTerm?.toLowerCase() || "")
    );

    const handleLoadMore = () => setVisibleCount(prev => prev + PAGE_SIZE);
    const handleShowLess = () => setVisibleCount(PAGE_SIZE);

    const scrollToGrid = () => {
        const gridElement = document.getElementById("explore-all-grid");
        if (gridElement) {
            gridElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="py-12 ">
            <div className="container mx-auto px-4">
                {/* Category Banners Section */}
                {banners.length > 0 && (
                    <div className="mb-16">
                        <BannerCarousel banners={banners} />
                    </div>
                )}
                {/* Sub-categories sliders if defined */}
                {subCategories && subCategories.length > 0 && !searchTerm && (
                    <div className="space-y-12 mb-20 border-b border-gray-100 pb-20">
                        {subCategories.map((sub) => {
                            const subProducts = products.filter(p => {
                                const catMatch = sub.keys.some(k => p.category?.toLowerCase() === k.toLowerCase());
                                if (!catMatch) return false;

                                if (sub.include && sub.include.length > 0) {
                                    return sub.include.some(word => p.title?.toLowerCase().includes(word.toLowerCase()));
                                }
                                if (sub.exclude && sub.exclude.length > 0) {
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
                                    onViewDetails={onViewDetails}
                                    liked={liked}
                                    onToggleLike={onToggleLike}
                                    onExploreAll={scrollToGrid}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Main Grid with Load More */}
                <div className="mt-12" id="explore-all-grid">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-gray-900 tracking-tighter">
                            {searchTerm ? `Search Results for "${searchTerm}"` : `Explore All ${title}`}
                        </h2>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
                            {filteredProducts.length} Items Total
                        </span>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredProducts.slice(0, visibleCount).map((product) => (
                                    <ProductCard
                                        key={product.product_id}
                                        product={product}
                                        isLiked={!!liked[product.product_id]}
                                        onViewDetails={onViewDetails}
                                        onToggleLike={onToggleLike}
                                    />
                                ))}
                            </div>

                            {/* Pagination Buttons */}
                            <div className="flex flex-col items-center gap-6 mt-10">
                                <div className="h-px w-24 bg-linear-to-r from-transparent via-gray-300 to-transparent"></div>
                                <div className="flex items-center gap-4">
                                    {visibleCount < filteredProducts.length && (
                                        <button
                                            onClick={handleLoadMore}
                                            className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-black text-base transition-all active:scale-95 shadow-md"
                                        >
                                            Load More
                                        </button>
                                    )}
                                    {visibleCount > PAGE_SIZE && (
                                        <button
                                            onClick={handleShowLess}
                                            className="bg-white text-gray-900 border-2 border-gray-100 px-8 py-2 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all transform active:scale-95"
                                        >
                                            Show Less
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500 text-xl font-medium">
                                {searchTerm ? `No products found matching "${searchTerm}"` : `Coming Soon: New items for ${title}`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
