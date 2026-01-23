import React, { useState, useEffect } from 'react'
import BannerCarousel from '../component/BannerCarousel'
import { getBanners } from '../services/ShopService'

const About = () => {
    const [banners, setBanners] = useState([])

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const bannerData = await getBanners()
                if (bannerData.status === "success") {
                    const aboutBanners = bannerData.banners.filter(
                        b => b.is_active && b.position === 'about'
                    )
                    setBanners(aboutBanners)
                }
            } catch (err) {
                console.error("Failed to fetch about banners", err)
            }
        }
        fetchBanners()
    }, [])
    return (
        <div className="py-12 bg-white">
            <div className="container mx-auto px-4">
                {/* Banners Section */}
                {banners.length > 0 && (
                    <div className="mb-16">
                        <BannerCarousel banners={banners} />
                    </div>
                )}

                {/* Banner Section */}
                <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 group mb-16">
                    <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                        className="w-full h-112.5 object-cover"
                        alt="About Us"
                    />
                    <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center p-8">
                        <h1 className="text-6xl font-extrabold text-white mb-4 tracking-tight">Our Story</h1>
                        <p className="text-white/90 max-w-2xl text-xl leading-relaxed">
                            Bringing the freshest ingredients and modern lifestyle essentials to your doorstep since 2021.
                        </p>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 text-center">
                    <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="text-indigo-600 mb-4 text-4xl">🌱</div>
                        <h3 className="text-2xl font-bold mb-3">Fresh & Organic</h3>
                        <p className="text-gray-600">We partner directly with local farmers to ensure you get the highest quality produce every single day.</p>
                    </div>
                    <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="text-indigo-600 mb-4 text-4xl">⚡</div>
                        <h3 className="text-2xl font-bold mb-3">Fast Delivery</h3>
                        <p className="text-gray-600">Our optimized logistics network guarantees your orders arrive within hours, not days.</p>
                    </div>
                    <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="text-indigo-600 mb-4 text-4xl">🤝</div>
                        <h3 className="text-2xl font-bold mb-3">Community First</h3>
                        <p className="text-gray-600">Supporting local businesses and sustainable practices is at the heart of everything we do.</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-12 mb-20">
                    <section>
                        <h2 className="text-4xl font-extrabold mb-6 text-gray-900 border-l-8 border-indigo-600 pl-6">Mission</h2>
                        <p className="text-lg text-gray-700 leading-relaxed italic">
                            "To redefine the grocery shopping experience by combining technology, sustainability, and quality, making healthy living accessible to every household."
                        </p>
                    </section>

                    <section>
                        <h2 className="text-4xl font-extrabold mb-6 text-gray-900 border-l-8 border-indigo-600 pl-6">Values</h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <li className="flex items-start gap-4">
                                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg font-bold">01</span>
                                <div>
                                    <h4 className="font-bold text-xl">Integrity</h4>
                                    <p className="text-gray-600">Honesty in our sourcing and pricing.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg font-bold">02</span>
                                <div>
                                    <h4 className="font-bold text-xl">Quality</h4>
                                    <p className="text-gray-600">Only the best for our customers.</p>
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default About
