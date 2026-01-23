import React, { useMemo, useState, useEffect } from "react";
import ProductDiscovery from "../component/ProductDiscovery";
import BannerCarousel from "../component/BannerCarousel";
import { CircularProgress } from "@mui/material";
import { getProducts, getCategories, getBanners } from "../services/ShopService";

const PAGE_SIZE = 12;

const Products = ({ searchTerm, onViewDetails, liked, onToggleLike }) => {
    const [productsList, setProductsList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categoryLoading, setCategoryLoading] = useState(true);
    // const [currentPage, setCurrentPage] = useState(1);
    // const [totalPages, setTotalPages] = useState(1);
    // const [totalProducts, setTotalProducts] = useState(0);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                setCategoryLoading(true);
                const [catData, bannerData] = await Promise.all([
                    getCategories(),
                    getBanners()
                ]);

                if (catData.status === "success" && Array.isArray(catData.categories)) {
                    setCategories(catData.categories);
                }

                if (bannerData.status === "success") {
                    // Filter banners for products page
                    const productBanners = bannerData.banners.filter(
                        b => b.is_active && b.position === 'products'
                    );
                    setBanners(productBanners);
                }
            } catch (err) {
                console.error("Failed to fetch metadata", err);
            } finally {
                setCategoryLoading(false);
            }
        };

        fetchMetadata();
    }, []);

    const fetchProducts = async (page = 1) => {
        try {
            setLoading(true);
            let query = `page=${page}&limit=${PAGE_SIZE}`;
            if (selectedCategory) {
                query += `&category=${selectedCategory.slug}`;
            }
            const data = await getProducts(query);
            console.log(data, "image for it");

            setProductsList(data.products || []);
            setCurrentPage(data.page || page);
            setTotalPages(data.totalPages || 1);
            setTotalProducts(data.total || 0);
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(1);
    }, [selectedCategory]);

    // const handlePageChange = (page) => {
    //     fetchProducts(page);
    // };

    const filteredProducts = useMemo(() => {
        const term = searchTerm?.toLowerCase() || "";
        if (!term) return productsList;

        return productsList.filter(
            (p) =>
                p.title?.toLowerCase().includes(term)
        );
    }, [searchTerm, productsList]);

    if (loading && categoryLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="py-12 bg-white">
            <div className="container mx-auto px-4">
                {/* Banner Carousel - Show on products page */}
                {banners.length > 0 && (
                    <div className="mb-16">
                        <BannerCarousel banners={banners} />
                    </div>
                )}

                {banners.length === 0 && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">Filter by Category:</h3>

                            {selectedCategory && (
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {categoryLoading ? (
                                <p className="text-gray-500">Loading categories...</p>
                            ) : categories.length > 0 ? (
                                categories.map((cat) => (
                                    <button
                                        key={cat.category_id}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedCategory?.category_id === cat.category_id
                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))
                            ) : (
                                <p className="text-gray-500">No categories available</p>
                            )}
                        </div>
                    </div>
                )}

                <ProductDiscovery
                    title={selectedCategory ? `${selectedCategory.name} Products` : "Best Sellers"}
                    subtitle={selectedCategory ? `Browse our ${selectedCategory.name} collection` : "Our most loved fresh items this week"}
                    products={filteredProducts}
                    layout={selectedCategory ? "grid" : "slider"}
                    onViewDetails={onViewDetails}
                    liked={liked}
                    onToggleLike={onToggleLike}
                />

                {!selectedCategory && (
                    <>
                        <div className="my-10 border-t border-gray-100"></div>

                        <ProductDiscovery
                            title="New Arrivals"
                            subtitle="Freshly stocked and ready for your cart"
                            products={filteredProducts}
                            layout="grid"
                            onViewDetails={onViewDetails}
                            liked={liked}
                            onToggleLike={onToggleLike}
                        />
                    </>
                )}

                
            </div>
        </div>
    );
}

export default Products;

