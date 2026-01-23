import React from "react";
import Slider from "react-slick";
import { Button } from "@mui/material";
import ArrowRightAltOutlinedIcon from "@mui/icons-material/ArrowRightAltOutlined";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const ProductDiscovery = ({ title, subtitle, products, layout = "slider", onViewDetails, onToggleLike, liked, onExploreAll }) => {
    const productSetting = {
        dots: false,
        infinite: products.length > 4,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <div className="py-5">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{title}</h2>
                    {subtitle && <p className="text-gray-500 text-lg font-medium">{subtitle}</p>}
                </div>
                {onExploreAll ? (
                    <Button
                        onClick={onExploreAll}
                        className="group text-indigo-600! bg-indigo-50! hover:bg-indigo-100! rounded-2xl! px-8! py-3! capitalize! text-base! font-bold! transition-all shrink-0"
                    >
                        Explore All
                        <ArrowRightAltOutlinedIcon className="ml-2 group-hover:translate-y-2 transition-transform rotate-90" />
                    </Button>
                ) : (
                    <Link to="/main/products" className="shrink-0">
                        <Button
                            className="group text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-2xl px-8 py-3 capitalize text-base font-bold transition-all"
                        >
                            Explore All
                            <ArrowRightAltOutlinedIcon className="ml-2 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </Link>
                )}
            </div>

            {layout === "slider" ? (
                <Slider {...productSetting} className="product-slider -mx-2">
                    {products.map((product) => (
                        <div key={product.product_id || product.id} className="px-2 pb-4 h-full">
                            <ProductCard
                                product={product}
                                isLiked={!!liked[product.product_id || product.id]}
                                onViewDetails={onViewDetails}
                                onToggleLike={onToggleLike}
                            />
                        </div>
                    ))}
                </Slider>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard
                            key={product.product_id || product.id}
                            product={product}
                            isLiked={!!liked[product.product_id || product.id]}
                            onViewDetails={onViewDetails}
                            onToggleLike={onToggleLike}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductDiscovery;
