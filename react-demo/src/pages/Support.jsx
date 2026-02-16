import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Alert } from '@mui/material'
import BannerCarousel from '../component/BannerCarousel'
import { ContactInfoCard } from '../component/ContactInfoCard'
import { getBanners } from '../services/ShopService'
import { getSupportCategories, createSupportTicket, getUserSupportTickets, getSupportTicketReplies, addSupportTicketReply } from '../services/SupportService'
import { useAuth } from '../context/AuthContext'

const Support = () => {
    const { isAuthenticated, user } = useAuth()
    const [submitted, setSubmitted] = useState(false)
    const [banners, setBanners] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('form') // 'form' or 'tickets'
    const [tickets, setTickets] = useState([])
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

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

    useEffect(() => {
        if (activeTab === 'tickets' && isAuthenticated) {
            fetchTickets(page)
        }
    }, [activeTab, page, isAuthenticated])

    const fetchTickets = async (pageNum) => {
        setLoading(true)
        try {
            const data = await getUserSupportTickets(pageNum, 5)
            if (data.status === "success") {
                setTickets(data.tickets)
                setTotalPages(data.totalPages)
            }
        } catch (err) {
            console.error("Failed to fetch tickets", err)
        } finally {
            setLoading(false)
        }
    }

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
                // Switch to tickets tab to show the new ticket
                setActiveTab('tickets')
            }
        } catch (err) {
            console.error("Failed to create ticket", err)
            setError(err.response?.data?.message || "Failed to create support ticket")
        } finally {
            setLoading(false)
        }
    }

    const handleViewTicket = async (ticket) => {
        setSelectedTicket(ticket)
        try {
            // "getSupportTicketReplies" in backend actually returns the ticket with the latest message field
            const repliesData = await getSupportTicketReplies(ticket.ticket_id)
            if (repliesData.status === "success" && repliesData.replies.length > 0) {
                // Update the selected ticket's message with the latest from backend
                setSelectedTicket(prev => ({
                    ...prev,
                    message: repliesData.replies[0].message,
                    updated_at: repliesData.replies[0].updated_at
                }))
            }
        } catch (err) {
            console.error("Failed to fetch replies", err)
        }
    }

    const handleReplySubmit = async (e) => {
        e.preventDefault()
        if (!replyText.trim()) return

        try {
            const result = await addSupportTicketReply(selectedTicket.ticket_id, { reply_text: replyText })
            if (result.status === "success") {
                // Backend returns the updated ticket
                setSelectedTicket(result.ticket)
                setReplyText('')

                // Also update the ticket in the list
                setTickets(prev => prev.map(t =>
                    t.ticket_id === result.ticket.ticket_id ? result.ticket : t
                ))
            }
        } catch (err) {
            console.error("Failed to send reply", err)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-800'
            case 'In Progress': return 'bg-yellow-100 text-yellow-800'
            case 'Resolved': return 'bg-green-100 text-green-800'
            case 'Closed': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
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
                <div className="text-center max-w-3xl mx-auto mb-10">
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
                    <div className="max-w-6xl mx-auto">
                        {/* Tabs */}
                        <div className="flex justify-center mb-10 space-x-4">
                            <button
                                onClick={() => { setActiveTab('form'); setSelectedTicket(null); }}
                                className={`px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'form' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Send Request
                            </button>
                            <button
                                onClick={() => setActiveTab('tickets')}
                                className={`px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                My Requests
                            </button>
                        </div>

                        {activeTab === 'form' ? (
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
                                    {/* back button go on Contact */}
                                    <div className='justify-self-end cursor-pointer'>
                                        <Link
                                            to='/main/contact'
                                            className='underline'
                                        >
                                            ← Back to Contact
                                        </Link>
                                    </div>
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
                                            {loading ? "Sending Request..." : "Send Request"}
                                        </Button>
                                    </form>
                                </div>
                                {/* Information */}
                                <ContactInfoCard type="support" />
                            </div>
                        ) : !selectedTicket ? (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                {tickets.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 font-bold text-gray-600">Subject</th>
                                                    <th className="px-6 py-4 font-bold text-gray-600">Status</th>
                                                    <th className="px-6 py-4 font-bold text-gray-600">Priority</th>
                                                    <th className="px-6 py-4 font-bold text-gray-600">Last Updated</th>
                                                    <th className="px-6 py-4 font-bold text-gray-600">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {tickets.map(ticket => (
                                                    <tr key={ticket.ticket_id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-medium">{ticket.subject}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                                                {ticket.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.priority === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                {ticket.priority}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                                            {new Date(ticket.updated_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => handleViewTicket(ticket)}
                                                                className="text-indigo-600 font-bold hover:text-indigo-800"
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {totalPages > 1 && (
                                            <div className="flex justify-center p-4 gap-2">
                                                <button
                                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                                    disabled={page === 1}
                                                    className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
                                                >
                                                    Prev
                                                </button>
                                                <span className="px-4 py-2">Page {page} of {totalPages}</span>
                                                <button
                                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={page === totalPages}
                                                    className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-gray-500">
                                        You haven't created any support requests yet.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="text-gray-600 hover:text-gray-900 font-bold flex items-center gap-2"
                                    >
                                        ← Back to Requests
                                    </button>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTicket.subject}</h2>
                                    <p className="text-gray-500 text-sm mb-6">
                                        Created on {new Date(selectedTicket.created_at).toLocaleDateString()}
                                    </p>

                                    <span className="text-gray-700 font-bold">Message</span>
                                    <div className="bg-gray-50 p-2 rounded-2xl mb-8 border border-gray-100">

                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
                                    </div>

                                    {/* if thier is only rply from admin other wise not */}
                                    {selectedTicket.admin_reply && (
                                        <>
                                            <span className="text-gray-700 font-bold">Admin Reply</span>
                                            <div className="bg-gray-50 p-2 rounded-2xl mb-8 border border-gray-100">
                                                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.admin_reply}</p>
                                            </div>
                                        </>
                                    )}



                                    {/* Reply Form */}
                                    {selectedTicket.status !== 'Closed' && (
                                        <div className="mt-8 border-t border-gray-100 pt-8">
                                            <h3 className="font-bold text-lg mb-4">Add a Reply</h3>
                                            <form onSubmit={handleReplySubmit}>
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all h-32 resize-none mb-4"
                                                    placeholder="Type your reply here..."
                                                    required
                                                />
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    className="bg-indigo-600! hover:bg-indigo-700!"
                                                >
                                                    Send Reply
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Support
