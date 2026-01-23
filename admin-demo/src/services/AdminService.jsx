import APIManager from "../api/ApiManager";
import API_ENDPOINT from "../api/ApiEndpoint";

export const login = async (data) => {
    return await APIManager.postRequest({ path: API_ENDPOINT.LOGIN, data });
};

export const getStats = async () => {
    return await APIManager.getRequest({ path: API_ENDPOINT.GET_STATS, token: true });
};

// Shipping
export const getShippingOptions = async () => {
    return await APIManager.getRequest({
        path: '/admin/shipping-options',
        token: true
    });
};
export const addShippingOption = async (data) => {
    return await APIManager.postRequest({
        path: '/admin/shipping-options',
        data, token: true
    });
};
export const updateShippingOption = async (id, data) => {
    return await APIManager.putRequest({
        path: `/admin/shipping-options/${id}`,
        data, token: true
    });
};
export const deleteShippingOption = async (id) => {
    return await APIManager.deleteRequest({
        path: `/admin/shipping-options/${id}`,
        token: true
    });
};

export const updateOrderShipping = async (id, data) => {
    return await APIManager.putRequest({
        path: `/admin/orders/${id}/shipping`,
        data: data,
        token: true
    });
};

export const getOrders = async (page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status })
    });
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_ORDERS}?${params}`,
        token: true
    });
}

export const updateOrderStatus = async (id, status) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.UPDATE_ORDER_STATUS(id),
        data: { status },
        token: true
    });
};

export const getProducts = async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search })
    });

    return APIManager.getRequest({
        path: `${API_ENDPOINT.GET_PRODUCTS}?${params}`,
        token: true
    });
};

export const addProduct = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.ADD_PRODUCT,
        data,
        token: true
    });
};
export const updateProduct = async (id, data) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.UPDATE_PRODUCT(id),
        data,
        token: true
    });
};
export const toggleProductStatus = async (id) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.TOGGLE_PRODUCT_STATUS(id),
        token: true
    });
};
export const softDeleteProduct = async (id) => {
    return await APIManager.deleteRequest({
        path: API_ENDPOINT.SOFT_DELETE_PRODUCT(id),
        token: true
    });
};
export const bulkAddProducts = async (products) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.BULK_ADD_PRODUCTS,
        data: { products },
        token: true
    });
};

export const getCategories = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.GET_CATEGORIES,
        token: true
    });
};
export const addCategory = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.ADD_CATEGORY,
        data,
        token: true
    });
};
export const updateCategory = async (id, data) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.UPDATE_CATEGORY(id),
        data,
        token: true
    });
};
export const deleteCategory = async (id) => {
    return await APIManager.deleteRequest({
        path: API_ENDPOINT.DELETE_CATEGORY(id),
        token: true
    });
};

export const getCustomers = async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search })
    });
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_CUSTOMERS}?${params}`,
        token: true
    });
};
export const updateCustomerRole = async (id, role) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.UPDATE_CUSTOMER_ROLE(id),
        data: { role },
        token: true
    });
};
export const toggleCustomerBlock = async (id) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.TOGGLE_CUSTOMER_BLOCK(id),
        token: true
    });
};

export const getTickets = async (page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status })
    });
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_TICKETS}?${params}`,
        token: true
    });
};
export const updateTicketStatus = async (id, status, reply) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.UPDATE_TICKET_STATUS(id),
        data: { status, reply },
        token: true
    });
};

export const getSettings = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.GET_SETTINGS,
        token: true
    });
};
export const updateSettings = async (data) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.UPDATE_SETTINGS,
        data, token: true
    });
};

export const getCoupons = async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search })
    });
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_COUPONS}?${params}`,
        token: true
    });
};
export const addCoupon = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.ADD_COUPON,
        data,
        token: true

    });
};
export const deleteCoupon = async (id) => {
    return await APIManager.deleteRequest({
        path: API_ENDPOINT.DELETE_COUPON(id),
        token: true

    });
};

export const getBanners = async (page = 1, limit = 12) => {
    const params = new URLSearchParams({ page, limit });
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_BANNERS}?${params}`,
        token: true
    });
};
export const deleteBanner = async (id) => {
    return await APIManager.deleteRequest({
        path: API_ENDPOINT.DELETE_BANNER(id),
        token: true

    });
};

export const getReviews = async (page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status })
    });
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_REVIEWS}?${params}`,
        token: true
    });
};
export const updateReviewStatus = async (id, status) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.UPDATE_REVIEW_STATUS(id),
        data: { status },
        token: true
    });
};

export const getShippingZones = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.GET_SHIPPING_ZONES,
        token: true

    });
};

export const getTransactions = async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page, limit });
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_TRANSACTIONS}?${params}`,
        token: true
    });
};

export const getLogs = async (page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_LOGS}?${params}`,
        token: true
    });
};


export const addBanner = async (data) => {
    return await APIManager.postRequest({
        path: '/admin/banners',
        data,
        token: true
    });
};

export const updateBanner = async (id, data) => {
    return await APIManager.putRequest({
        path: `/admin/banners/${id}`,
        data,
        token: true
    });
};
export const uploadBannerImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    return await APIManager.postRequest({
        path: '/admin/upload-banner-image',
        data: formData,
        token: true
    });
};

export const uploadProductImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    return await APIManager.postRequest({
        path: '/admin/upload-product-image',
        data: formData,
        token: true
    });
};
