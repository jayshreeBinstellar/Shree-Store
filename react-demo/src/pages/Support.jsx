import React, { useState, useEffect } from 'react'
import { Button, Alert } from '@mui/material'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import EmailIcon from '@mui/icons-material/Email'
import PlaceIcon from '@mui/icons-material/Place'
import BannerCarousel from '../component/BannerCarousel'
import { getBanners } from '../services/ShopService'
import { getSupportCategories, createSupportTicket } from '../services/SupportService'
import { useAuth } from '../context/AuthContext'

const Support = () => {
    const { isAuthenticated } = useAuth()
    const [submitted, setSubmitted] = useState(false)
    const [banners, setBanners] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('form') // 'form' or 'tickets'
    const [tickets, setTickets] = useState([])
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [ticketReplies, setTicketReplies] = useState([])

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'Normal',
        category: 'General'
    })

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // Fetch banners
                const bannerData = await getBanners()
                if (bannerData.status === "success") {
                    const supportBanners = bannerData.banners.filter(
                        b => b.is_active && b.position === 'contact'
                    )
                    setBanners(supportBanners)
                }

                // Fetch support categories
                const categoriesData = await getSupportCategories()
                if (categoriesData.status === "success") {
                    setCategories(categoriesData.categories)
                }
            } catch (err) {
                console.error("Failed to fetch metadata", err)
            }
        }
        fetchMetadata()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!isAuthenticated) {
            setError("Please log in to create a support ticket")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const result = await createSupportTicket({
                subject: formData.subject,
                message: formData.message,
                priority: formData.priority,
                category: formData.category
            })

            if (result.status === "success") {
                setSubmitted(true)
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                    priority: 'Normal',
                    category: 'General'
                })
                setTimeout(() => setSubmitted(false), 5000)
            }
        } catch (err) {
            console.error("Failed to create ticket", err)
            setError(err.response?.data?.message || "Failed to create support ticket")
        } finally {
            setLoading(false)
        }
    }

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
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Have a question or need assistance? Our dedicated team is here to help you find exactly what you need.
                    </p>
                </div>

                {!isAuthenticated ? (
                    <div className="max-w-2xl mx-auto bg-blue-50 border-2 border-blue-200 rounded-3xl p-8 mb-12 text-center">
                        <p className="text-gray-800 font-semibold mb-4">Please log in to create a support ticket</p>
                        <Button 
                            href="/login" 
                            variant="contained" 
                            className="bg-indigo-600! hover:bg-indigo-700!"
                        >
                            Go to Login
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">
                        {/* Contact Form */}
                        <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 shadow-sm">
                            {submitted && (
                                <Alert severity="success" className="mb-6 rounded-xl">
                                    Thank you for your message! Your support ticket has been created. We'll get back to you soon!
                                </Alert>
                            )}
                            
                            {error && (
                                <Alert severity="error" className="mb-6 rounded-xl">
                                    {error}
                                </Alert>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                                    <input 
                                        required 
                                        type="text" 
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" 
                                        placeholder="How can we help?" 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                                        <select 
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Priority</label>
                                        <select 
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Normal">Normal</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                                    <textarea 
                                        required 
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all h-40 resize-none" 
                                        placeholder="Write your message here..."
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    disabled={loading}
                                    className="bg-indigo-600! hover:bg-indigo-700! py-4! rounded-xl! font-bold! text-lg! w-full! shadow-lg!"
                                >
                                    {loading ? "Creating Ticket..." : "Create Support Ticket"}
                                </Button>
                            </form>
                        </div>

                        {/* Information */}
                        <div className="space-y-12 py-4">
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="bg-indigo-100 p-4 rounded-2xl">
                                        <LocalPhoneIcon className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Phone Support</h4>
                                        <p className="text-gray-600">+1 (555) 000-0000</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="bg-indigo-100 p-4 rounded-2xl">
                                        <EmailIcon className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Email Us</h4>
                                        <p className="text-gray-600">support@grocerystore.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="bg-indigo-100 p-4 rounded-2xl">
                                        <PlaceIcon className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Visit Us</h4>
                                        <p className="text-gray-600">123 Main Street, City, Country 12345</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
                                <h4 className="font-bold text-gray-900 mb-3">Response Time</h4>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li><strong>Normal:</strong> 24-48 hours</li>
                                    <li><strong>High:</strong> 12-24 hours</li>
                                    <li><strong>Urgent:</strong> 2-4 hours</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Support
