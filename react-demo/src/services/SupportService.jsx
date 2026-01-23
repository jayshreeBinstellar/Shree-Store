import APIManager from "../api/ApiManager";
import API_ENDPOINT from "../api/ApiEndpoint";

// Create a new support ticket
export const createSupportTicket = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.SUPPORT_TICKETS,
        data,
        token: true
    });
};

// Get user's support tickets
export const getUserSupportTickets = async (page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status })
    });
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.SUPPORT_TICKETS}?${params}`,
        token: true
    });
};

// Get single ticket details
export const getSupportTicketDetails = async (ticketId) => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.SUPPORT_TICKET_DETAIL(ticketId),
        token: true
    });
};

// Add reply to ticket
export const addSupportTicketReply = async (ticketId, data) => {
    return await APIManager.postRequest({
        path: `${API_ENDPOINT.SUPPORT_TICKETS}/${ticketId}/replies`,
        data,
        token: true
    });
};

// Get ticket conversation/replies
export const getSupportTicketReplies = async (ticketId) => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.SUPPORT_TICKET_REPLIES(ticketId),
        token: true
    });
};

// Close ticket
export const closeSupportTicket = async (ticketId) => {
    return await APIManager.putRequest({
        path: `${API_ENDPOINT.SUPPORT_TICKETS}/${ticketId}/close`,
        token: true
    });
};

// Reopen ticket
export const reopenSupportTicket = async (ticketId) => {
    return await APIManager.putRequest({
        path: `${API_ENDPOINT.SUPPORT_TICKETS}/${ticketId}/reopen`,
        token: true
    });
};

// Get support categories
export const getSupportCategories = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.SUPPORT_CATEGORIES
    });
};
