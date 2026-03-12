import APIManager from "../api/ApiManager";
import API_ENDPOINT from "../api/ApiEndpoint";

export const buildQueryString = (params) => {
    if (!params) return '';

    // If it's not an object (old signature), we return empty or handle specifically
    if (typeof params !== 'object') {
        return '';
    }

    const { first = 0, rows = 10, sortField, sortOrder, filters } = params;

    const queryParams = new URLSearchParams();

    // Map pagination
    queryParams.append('page', Math.floor(first / rows) + 1);
    queryParams.append('limit', rows);

    // Map sorting
    if (sortField) {
        queryParams.append('sortKey', sortField);
        // PrimeReact uses 1 for ASC, -1 for DESC
        // Explicitly check for -1 to return DESC, otherwise default to ASC
        queryParams.append('sortBy', sortOrder === -1 ? 'DESC' : 'ASC');
    }

    // Map filters
    const formattedFilters = [];
    if (filters) {
        Object.entries(filters).forEach(([column, filter]) => {
            if (!filter) return;

            const addFilter = (val, matchMode) => {
                // Skip empty values OR "All" placeholder
                if (val !== null && val !== undefined && val !== '' && val !== 'All') {

                    let finalizedValue = val;
                    let type = typeof val === 'number' ? 'number' : 'text';

                    // Detect booleans or "true"/"false" strings
                    if (val === true || val === false || val === 'true' || val === 'false') {
                        finalizedValue = (val === true || val === 'true');
                        type = 'boolean';
                    }

                    formattedFilters.push({
                        column: column === 'global' ? 'all' : column,
                        type: type,
                        value: finalizedValue,
                        operator: matchMode || 'contains'
                    });
                }
            };

            if (filter) {
                if (filter.constraints) {
                    filter.constraints.forEach(c => {
                        if (c.value !== undefined && c.value !== null && c.value !== '') {
                            addFilter(c.value, c.matchMode);
                        }
                    });
                } else if (filter.value !== undefined) {
                    addFilter(filter.value, filter.matchMode);
                }
            }
        });
    }

    if (formattedFilters.length > 0) {
        queryParams.append('filters', JSON.stringify(formattedFilters));
    }

    return queryParams.toString();
};

const handleCompatibility = (params, oldArgsMapper) => {
    if (typeof params !== 'object' || params === null) {
        return buildQueryString(oldArgsMapper(params));
    }
    return buildQueryString(params);
};

export const login = async (data) => {
    return await APIManager.postRequest({ path: API_ENDPOINT.LOGIN, data });
};

// Password Reset Functions
export const forgotPassword = async (email) => {
    return await APIManager.postRequest({ 
        path: API_ENDPOINT.FORGOT_PASSWORD, 
        data: { email } 
    });
};

export const verifyOTP = async (email, otp) => {
    return await APIManager.postRequest({ 
        path: API_ENDPOINT.VERIFY_OTP, 
        data: { email, otp } 
    });
};

export const resetPassword = async (resetToken, newPassword) => {
    return await APIManager.postRequest({ 
        path: API_ENDPOINT.RESET_PASSWORD, 
        data: { resetToken, newPassword } 
    });
};

export const resendOTP = async (email) => {
    return await APIManager.postRequest({ 
        path: API_ENDPOINT.RESEND_OTP, 
        data: { email } 
    });
};

export const getStats = async () => {
    return await APIManager.getRequest({ path: API_ENDPOINT.GET_STATS, token: true });
};

// Shipping
export const getShippingOptions = async (paramsOrSearch) => {
    const query = handleCompatibility(paramsOrSearch, (search) => ({
        filters: {
            global: { value: search || '', matchMode: 'contains' }
        }
    }));
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_SHIPPING_ZONE}?${query}`,
        token: true
    });
};
export const addShippingOption = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.ADD_SHIPPING_ZONE,
        data, token: true
    });
};
export const updateShippingOption = async (id, data) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.UPDATE_SHIPPING_ZONE(id),
        data, token: true
    });
};
export const deleteShippingOption = async (id) => {
    return await APIManager.deleteRequest({
        path: API_ENDPOINT.DELETE_SHIPPING_ZONE(id),
        token: true
    });
};

export const updateOrderShipping = async (id, data) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.UPDATE_ORDER_SHIPPING(id),
        data: data,
        token: true
    });
};

export const getOrders = async (paramsOrStatus, search) => {
    const query = handleCompatibility(paramsOrStatus, (status) => ({
        filters: {
            status: { value: status !== 'All' ? status : '', matchMode: 'equals' },
            global: { value: search || '', matchMode: 'contains' }
        }
    }));
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_ORDERS}?${query}`,
        token: true
    });
};

export const updateOrderStatus = async (id, status) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.UPDATE_ORDER_STATUS(id),
        data: { status },
        token: true
    });
};

export const getProducts = async (paramsOrSearch, category, status) => {
    const query = handleCompatibility(paramsOrSearch, (search) => ({
        filters: {
            global: { value: search || '', matchMode: 'contains' },
            category: { value: category || '', matchMode: 'equals' },
            is_active: { value: status || '', matchMode: 'equals' }
        }
    }));
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_PRODUCTS}?${query}`,
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

export const getCategories = async (paramsOrSearch) => {
    const query = handleCompatibility(paramsOrSearch, (search) => ({
        filters: {
            global: { value: search || '', matchMode: 'contains' }
        }
    }));
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_CATEGORIES}?${query}`,
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

export const getCustomers = async (paramsOrSearch) => {
    const query = handleCompatibility(paramsOrSearch, (search) => ({
        filters: {
            global: { value: search || '', matchMode: 'contains' }
        }
    }));
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_CUSTOMERS}?${query}`,
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
export const addCustomer = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.ADD_CUSTOMER,
        data,
        token: true
    });
};

export const getTickets = async (paramsOrStatus, search) => {
    const query = handleCompatibility(paramsOrStatus, (status) => ({
        filters: {
            status: { value: status !== 'All' ? status : '', matchMode: 'equals' },
            global: { value: search || '', matchMode: 'contains' }
        }
    }));
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_TICKETS}?${query}`,
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

export const getCoupons = async (paramsOrSearch) => {
    const query = handleCompatibility(paramsOrSearch, (search) => ({
        filters: {
            global: { value: search || '', matchMode: 'contains' }
        }
    }));
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_COUPONS}?${query}`,
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

export const getBanners = async (paramsOrSearch) => {
    const query = handleCompatibility(paramsOrSearch, (search) => ({
        filters: {
            global: { value: search || '', matchMode: 'contains' }
        }
    }));
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_BANNERS}?${query}`,
        token: true
    });
};
export const deleteBanner = async (id) => {
    return await APIManager.deleteRequest({
        path: API_ENDPOINT.DELETE_BANNER(id),
        token: true

    });
};

export const getReviews = async (paramsOrSearch) => {
    const query = handleCompatibility(paramsOrSearch, (search) => ({
        filters: {
            global: { value: search || '', matchMode: 'contains' }
        }
    }));
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_REVIEWS}?${query}`,
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
        path: API_ENDPOINT.GET_SHIPPING_ZONE,
        token: true

    });
};

export const getTransactions = async (lazyParams) => {
    const query = handleCompatibility(lazyParams, () => ({}));
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_TRANSACTIONS}?${query}`,
        token: true
    });
};

export const getLogs = async (paramsOrSearch) => {
    const query = handleCompatibility(paramsOrSearch, (search) => ({
        filters: {
            global: { value: search || '', matchMode: 'contains' }
        }
    }));
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.GET_LOGS}?${query}`,
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

// --- New Standardized API Functions ---

export const getUser = async (params) => {
    const queryParams = { ...params, first: params?.first || 0, rows: params?.rows || 10 };
    const query = buildQueryString(queryParams);
    return await APIManager.getRequest({
        path: API_ENDPOINT.GET_CUSTOMERS + `?${query}`,
        token: true
    });
};


export const bulkDeleteProducts = async (ids) => {
    return await APIManager.postRequest({
        path: '/admin/products/bulk-delete',
        data: { ids },
        token: true
    });
};

export const bulkUpdateProductStatus = async (ids, status) => {
    return await APIManager.postRequest({
        path: '/admin/products/bulk-status',
        data: { ids, status },
        token: true
    });
};

export const bulkUpdateOrderStatus = async (ids, status) => {
    return await APIManager.postRequest({
        path: '/admin/orders/bulk-status',
        data: { ids, status },
        token: true
    });
};

export const bulkToggleCustomerBlock = async (ids, is_blocked) => {
    return await APIManager.postRequest({
        path: '/admin/customers/bulk-block',
        data: { ids, is_blocked },
        token: true
    });
};

export const bulkDeleteCoupons = async (ids) => {
    return await APIManager.postRequest({
        path: '/admin/coupons/bulk-delete',
        data: { ids },
        token: true
    });
};

export const bulkDeleteBanners = async (ids) => {
    return await APIManager.postRequest({
        path: '/admin/banners/bulk-delete',
        data: { ids },
        token: true
    });
};

export const bulkDeleteCategories = async (ids) => {
    return await APIManager.postRequest({
        path: '/admin/categories/bulk-delete',
        data: { ids },
        token: true
    });
};

export const bulkUpdateReviewStatus = async (ids, status) => {
    return await APIManager.postRequest({
        path: '/admin/reviews/bulk-status',
        data: { ids, status },
        token: true
    });
};

export const bulkUpdateTransactionStatus = async (ids, status) => {
    return await APIManager.postRequest({
        path: '/admin/transactions/bulk-status',
        data: { ids, status },
        token: true
    });
};

export const bulkUpdateTicketStatus = async (ids, status) => {
    return await APIManager.postRequest({
        path: '/admin/tickets/bulk-status',
        data: { ids, status },
        token: true
    });
};

// Profile & Auth
export const getProfile = async () => {
    return await APIManager.getRequest({ 
        path: API_ENDPOINT.PROFILE, 
        token: true 
    });
};

export const logout = async () => {
    return await APIManager.postRequest({ 
        path: API_ENDPOINT.LOGOUT, 
        token: true 
    });
};

export const updateProfile = async (data) => {
    return await APIManager.putRequest({ 
        path: API_ENDPOINT.UPDATE_PROFILE, 
        data, 
        token: true 
    });
};

export const changeMyPassword = async (currentPassword, newPassword) => {
    return await APIManager.putRequest({ 
        path: API_ENDPOINT.CHANGE_PASSWORD, 
        data: { currentPassword, newPassword }, 
        token: true 
    });
};
