import React, { useMemo, useState, useEffect, useCallback } from "react";
import ProductDiscovery from "../component/ProductDiscovery";
import BannerCarousel from "../component/BannerCarousel";
import CategoryFilter from "../component/CategoryFilter";
import { CircularProgress } from "@mui/material";
import { getProducts, getCategories, getBanners } from "../services/ShopService";
import { useShop } from "../context/ShopContext";


//   Constants for the Products page
 
const PAGE_SIZE = 12;


//  Products Page Component
//  Displays a list of products with category filtering and search functionality.

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

    const fetchProducts = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            let query = `page=${page}&limit=${PAGE_SIZE}`;
            if (selectedCategory) {
                query += `&category=${selectedCategory.slug}`;
            }
            const data = await getProducts(query);

            setProductsList(data.products || []);
        } catch (err) {
            console.error("[Products] Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory]);

    // Handle Category Changes
    useEffect(() => {
        fetchProducts(1);
    }, [fetchProducts]);

    
    //  Filter products based on search term
 
    const filteredProducts = useMemo(() => {
        const term = searchTerm?.toLowerCase().trim() || "";
        if (!term) return productsList;

        return productsList.filter(
            (product) => product.title?.toLowerCase().includes(term)
        );
    }, [searchTerm, productsList]);

    // Derived UI State
    const showLoading = loading && categoryLoading;
    const bannerVisible = banners.length > 0;

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

                {/* Category Filtering - Only if no banner or forced by design */}
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
                        title={selectedCategory ? `${selectedCategory.name} Products` : "Best Sellers"}
                        subtitle={selectedCategory ? `Browse our ${selectedCategory.name} collection` : "Our most loved fresh items this week"}
                        products={filteredProducts}
                        layout={selectedCategory ? "grid" : "slider"}
                        onViewDetails={openDetails}
                        liked={liked}
                        onToggleLike={toggleLike}
                    />

                    {!selectedCategory && (
                        <>
                            <div className="border-t border-gray-100"></div>
                            <ProductDiscovery
                                title="New Arrivals"
                                subtitle="Freshly stocked and ready for your cart"
                                products={filteredProducts}
                                layout="grid"
                                onViewDetails={openDetails}
                                liked={liked}
                                onToggleLike={toggleLike}
                            />
                        </>
                    )}
                </section>

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
