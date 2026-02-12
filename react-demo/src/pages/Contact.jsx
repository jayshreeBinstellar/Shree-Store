import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Alert } from '@mui/material'
import BannerCarousel from '../component/BannerCarousel'
import { getBanners } from '../services/ShopService'
import { ContactInfoCard } from '../component/ContactInfoCard';

const Contact = () => {
    const [submitted, setSubmitted] = useState(false);
    const [banners, setBanners] = useState([])

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const bannerData = await getBanners()
                if (bannerData.status === "success") {
                    const contactBanners = bannerData.banners.filter(
                        b => b.is_active && b.position === 'contact'
                    )
                    setBanners(contactBanners)
                }
            } catch (err) {
                console.error("Failed to fetch contact banners", err)
            }
        }
        fetchBanners()
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="py-12 bg-white">
            <div className="container mx-auto px-4">
                {/* Banners Section */}
                {banners.length > 0 && (
                    <div className="mb-16">
                        <BannerCarousel banners={banners} />
                    </div>
                )}

                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Get in Touch</h1>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                        Have a question or need assistance? Our dedicated team is here to help you find exactly what you need.
                    </p>
                    <Button
                        component={Link}
                        to="/main/support"
                        variant="contained"
                        className="bg-indigo-600! hover:bg-indigo-700! py-3! px-8! rounded-full! font-bold! shadow-lg! transform hover:scale-105 transition-all"
                    >
                        Open Support Ticket
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Contact Form */}
                    <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 shadow-sm">
                        {submitted && (
                            <Alert severity="success" className="mb-6 rounded-xl">
                                Thank you for your message! Our team will get back to you shortly.
                            </Alert>
                        )}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                    <input required type="text" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                    <input required type="email" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                                <input required type="text" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="How can we help?" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                                <textarea required className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all h-40 resize-none" placeholder="Write your message here..."></textarea>
                            </div>
                            <Button type="submit" variant="contained" className="bg-indigo-600! hover:bg-indigo-700! py-4! rounded-xl! font-bold! text-lg! w-full! shadow-lg!">
                                Send Message
                            </Button>
                        </form>
                    </div>

                    <ContactInfoCard type="contact" />
                </div>
            </div>
        </div>
    )
}

export default Contact
