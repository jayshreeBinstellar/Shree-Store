import React, { useEffect, useState, useMemo, useCallback } from "react";
import AddCart from "./AddCart";
import { useCart } from "../context/CartContext";
import Reviews from "../component/Reviews";
import Slider from "react-slick";
import { getProduct, getRelatedProducts } from "../services/ShopService";

import { useShop } from "../context/ShopContext";

const Detail = () => {
    const { selectedProductId: productId, closeDetails, allowPurchase, setSelectedProductId } = useShop();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const { cart, addItem, removeItem, refreshCart } = useCart();

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        dotsClass: "slick-dots !bottom-4",
    };

    useEffect(() => {
        // Lock scroll
        document.body.style.overflow = 'hidden';

        return () => {
            // Unlock scroll
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        if (!productId) return;
        setLoading(true);

        const fetchProduct = async () => {
            try {
                const [productData, relatedData] = await Promise.all([
                    getProduct(productId),
                    getRelatedProducts(productId)
                ]);

                if (productData.status === "success" && productData.product) {
                    setProduct(productData.product);
                }

                if (relatedData.status === "success") {
                    setRelatedProducts(relatedData.products || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const isInCart = useMemo(() =>
        product ? cart.some(item => item.id === product.product_id) : false,
        [product, cart]);

    const images = useMemo(() =>
        (product?.images && product.images.length > 0) ? product.images : [product?.thumbnail],
        [product]);

    const handleCartAction = useCallback(async () => {
        if (!product || cartLoading) return;

        try {
            setCartLoading(true);

            if (isInCart) {
                await removeItem(product.product_id);
            } else {
                await addItem(product.product_id, 1);
            }

            if (refreshCart) refreshCart();
        } catch (error) {
            console.error("Cart action failed:", error);
        } finally {
            setCartLoading(false);
        }
    }, [product, isInCart, removeItem, addItem, refreshCart, cartLoading]);


    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <p className="text-base font-black animate-pulse text-indigo-600">Loading Product...</p>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 lg:p-10 animate-in fade-in duration-300">

            <div className="bg-white w-full max-w-5xl rounded-[40px] relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-full max-h-[60vh]">

                {/* Close Button */}
                <button
                    className=" cursor-pointer absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm text-gray-400 hover:text-gray-900 rounded-2xl transition-all z-20 shadow-sm border border-gray-100 active:scale-95"
                    onClick={closeDetails}
                >
                    <span className="text-xl font-light ">✕</span>
                </button>

                {/* Left Side: Product Gallery */}
                <div className="w-full md:w-[55%] bg-[#FDFDFD] relative h-64 md:h-auto overflow-hidden group">

                    <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-16">
                        <Slider {...sliderSettings} className="w-full h-full product-detail-slider">
                            {images.map((img, idx) => (
                                <div key={idx} className="h-full aspect-square outline-none">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <img
                                            src={img}
                                            alt={`${product.title}-${idx}`}
                                            className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>

                    {/* Discount Badge */}
                    {(product.discountPercentage || product.old_price) && (
                        <div className="absolute top-8 left-8 bg-rose-500 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-rose-200 z-10 flex items-center gap-1.5 animate-bounce-subtle">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            {product.discountPercentage ? Math.round(product.discountPercentage) : Math.round(((product.old_price - product.price) / product.old_price) * 100)}% Limited Offer
                        </div>
                    )}

                    {/* Decorative Elements */}
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-gray-100 rounded-full scale-150 opacity-20 pointer-events-none"></div>
                </div>

                {/* Right Side: Product Details */}
                <div className="w-full md:w-[45%] flex flex-col h-full bg-white relative">
                    <div className="flex-1 overflow-y-auto px-8 md:px-12 pt-12 pb-8 custom-scrollbar">
                        {/* Header Info */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.25em] bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                                    {product.category || "Collection"}
                                </span>
                                {product.stock > 0 && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                                        In Stock
                                    </span>
                                )}
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-[1.1]">
                                {product.title}
                            </h2>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <svg key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    ))}
                                    <span className="text-xs font-black text-gray-900 ml-1">{product.rating}</span>
                                </div>
                                <div className="h-4 w-px bg-gray-200"></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brand: <span className="text-gray-900">{product.brand || "Premium"}</span></span>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="mb-10 p-6 bg-gray-50 rounded-4xl border border-gray-100 relative group overflow-hidden">
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Net Price</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl font-black text-gray-900 tracking-tighter">${Number(product.price).toFixed(2)}</span>
                                        {product.old_price && (
                                            <span className="text-lg font-bold text-gray-300 line-through">${Number(product.old_price).toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Availability</p>
                                    <p className="text-sm font-black text-gray-900">{product.stock} units left</p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3 mb-10">
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Product Insight</h3>
                            <p className="text-gray-500 text-sm font-medium leading-[1.8]">
                                {product.description}
                            </p>
                        </div>

                        {/* Fast Shipping Badge */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl bg-white hover:border-indigo-100 hover:bg-indigo-50/10 transition-colors">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-900 uppercase">Express</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Shipping Available</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl bg-white hover:border-emerald-100 hover:bg-emerald-50/10 transition-colors">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-900 uppercase">Secure</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">1 Year Warranty</p>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="mt-12 border-t border-gray-100 pt-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Client Feedback</h3>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Verified Reviews</span>
                            </div>
                            <Reviews productId={productId} />
                        </div>

                        {/* Related Products Section */}
                        {relatedProducts.length > 0 && (
                            <div className="mt-12 border-t border-gray-100 pt-10 pb-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">You May Also Like</h3>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Recommendations</span>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    {relatedProducts.map((rp) => (
                                        <div
                                            key={rp.product_id}
                                            onClick={() => {
                                                const container = document.querySelector('.custom-scrollbar');
                                                if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                                                if (setSelectedProductId) setSelectedProductId(rp.product_id);
                                            }}
                                            className="group cursor-pointer"
                                        >
                                            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden mb-4 border border-gray-100 group-hover:border-indigo-100 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-indigo-50 relative">
                                                <img
                                                    src={rp.thumbnail}
                                                    alt={rp.title}
                                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-500"></div>
                                            </div>
                                            <h4 className="text-xs font-black text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors mb-1">{rp.title}</h4>
                                            <p className="text-[10px] font-bold text-indigo-600 tracking-tight">${Number(rp.price).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Action */}
                    {allowPurchase && (
                        <div className="px-8 md:px-12 py-6 bg-white border-t border-gray-100/10 shadow-[0_-15px_40px_rgba(0,0,0,0.03)] relative z-10">
                            <button
                                onClick={handleCartAction}
                                disabled={cartLoading}
                                className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3
                                ${isInCart
                                        ? "bg-gray-100 text-gray-900 hover:bg-rose-50 hover:text-rose-600 shadow-gray-100"
                                        : "bg-gray-900 text-white hover:bg-black shadow-gray-200"
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${isInCart ? 'rotate-45' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                </svg>
                                {cartLoading
                                    ? "Processing..."
                                    : isInCart
                                        ? "Remove from Basket"
                                        : "Add to Shopping Bag"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Detail;

