import React from "react";
import Slider from "react-slick";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import BASE_URL from "../api/ApiConstant";

const Arrow = ({ onClick, direction }) => (
    <button
        onClick={onClick}
        className={`absolute top-1/2 -translate-y-1/2 z-20 p-3 
        bg-black/60 hover:bg-black/80 text-white rounded-full transition
        ${direction === "left" ? "left-4" : "right-4"}`}
    >
        {direction === "left" ? (
            <ChevronLeftIcon className="h-6 w-6" />
        ) : (
            <ChevronRightIcon className="h-6 w-6" />
        )}
    </button>
);

const breakAfterWords = (text, count = 20) => {
    const words = text.split(" ");
    return (
        <>
            {words.slice(0, count).join(" ")}
            <br />
            {words.slice(count).join(" ")}
        </>
    );
};

const BannerCarousel = ({ banners = [] }) => {
    if (!banners.length) return null;

    const settings = {
        dots: true,
        infinite: banners.length > 1,
        speed: 800,
        fade: true,
        autoplay: true,
        autoplaySpeed: 5000,
        slidesToShow: 1,
        slidesToScroll: 1,
        pauseOnHover: true,
        prevArrow: <Arrow direction="left" />,
        nextArrow: <Arrow direction="right" />
    };

    return (
        <div className="relative overflow-hidden rounded-3xl mb-8">
            <Slider {...settings}>
                {banners.map((banner, index) => (
                    <div key={banner.banner_id || index}>
                        <div className="relative h-100">
                            {/* Image */}
                            <img
                                src={`${BASE_URL}${banner.image_url}`}
                                alt={banner.alt_text || banner.title}
                                className="w-full h-full object-cover"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent" />

                            {/* Content */}
                            <div className="absolute inset-0 flex items-center px-8 text-white">
                                <div className="max-w-xl">

                                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 flex flex-col justify-center items-center text-center px-6 md:px-12">
                                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                                            {banner.title}
                                        </h1>

                                        {banner.description && (
                                            <p className="text-white/90 max-w-2xl text-base md:text-xl leading-relaxed">
                                                {breakAfterWords(banner.description)}
                                            </p>
                                        )}

                                    </div>

                                    {banner.link_url && (
                                        <a
                                            href={banner.link_url}
                                            target={
                                                banner.link_url.startsWith("http")
                                                    ? "_blank"
                                                    : "_self"
                                            }
                                            rel="noopener noreferrer"
                                            className="inline-block px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition"
                                        >
                                            Explore Now
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default BannerCarousel;


//    <h1 className="text-4xl font-black mt-4 mb-4 leading-tight">
//                                         {banner.title}
//                                     </h1>

//                                     {banner.description && (
//                                         <p className="text-gray-300 mb-6">
//                                             {breakAfterWords(banner.description, 3)}
//                                         </p>
//                                     )}