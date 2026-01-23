
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import SupportDesk from '../../components/admin/SupportDesk';
import TicketModal from '../../components/admin/TicketModal';

const Support = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [currentFilter, setCurrentFilter] = useState('All');
    const [modalLoading, setModalLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTickets, setTotalTickets] = useState(0);

    const fetchTickets = async (status = 'All', page = 1) => {
        try {
            const filterStatus = status === 'All' ? '' : status;
            const data = await AdminService.getTickets(page, 10, filterStatus);
            if (data.status === "success") {
                setTickets(data.tickets);
                setCurrentPage(data.page || page);
                setTotalPages(data.totalPages || 1);
                setTotalTickets(data.total || 0);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const init = async () => {
        setLoading(true);
        await fetchTickets(currentFilter, 1);
        setLoading(false);
    }

    useEffect(() => {
        init();
    }, [currentFilter]);

    const handlePageChange = async (newPage) => {
        setLoading(true);
        await fetchTickets(currentFilter, newPage);
        setLoading(false);
    };

    const handleTicketReply = async () => {
        if (!replyText.trim()) return;
        
        try {
            setModalLoading(true);
            await AdminService.updateTicketStatus(selectedTicket.ticket_id, "Resolved", replyText);
            setReplyText("");
            setIsTicketModalOpen(false);
            fetchTickets(currentFilter);
        } catch (err) { 
            console.error(err); 
        } finally {
            setModalLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            setModalLoading(true);
            await AdminService.updateTicketStatus(selectedTicket.ticket_id, newStatus, "");
            setSelectedTicket(prev => ({ ...prev, status: newStatus }));
            fetchTickets(currentFilter);
        } catch (err) {
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
        setReplyText("");
        setIsTicketModalOpen(true);
    };

    return (
        <>
            <SupportDesk
                tickets={tickets}
                loading={loading}
                onViewTicket={handleViewTicket}
                onFilterChange={setCurrentFilter}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalTickets={totalTickets}
                isLoading={loading}
            />
            <TicketModal
                open={isTicketModalOpen} 
                onClose={() => setIsTicketModalOpen(false)}
                ticket={selectedTicket} 
                replyText={replyText} 
                setReplyText={setReplyText}
                onReply={handleTicketReply}
                onStatusChange={handleStatusChange}
                loading={modalLoading}
            />
        </>
    );
};

export default Support;
