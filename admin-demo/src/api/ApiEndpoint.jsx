
const API_ENDPOINT = {
    // Auth
    LOGIN: "/auth/login",

    // Dashboard
    GET_STATS: "/admin/stats",

    // Products
    GET_PRODUCTS: "/admin/products",
    ADD_PRODUCT: "/admin/products",
    BULK_ADD_PRODUCTS: "/admin/products/bulk",
    UPDATE_PRODUCT: (id) => `/admin/products/${id}`,
    DELETE_PRODUCT: (id) => `/admin/products/${id}`,
    TOGGLE_PRODUCT_STATUS: (id) => `/admin/products/${id}/status`,
    SOFT_DELETE_PRODUCT: (id) => `/admin/products/${id}/soft`,

    // Orders
    GET_ORDERS: "/admin/orders",
    UPDATE_ORDER_STATUS: (id) => `/admin/orders/${id}/status`,

    // Customers
    GET_CUSTOMERS: "/admin/customers",
    UPDATE_CUSTOMER_ROLE: (id) => `/admin/customers/${id}/role`,
    TOGGLE_CUSTOMER_BLOCK: (id) => `/admin/customers/${id}/block`,

    // Categories
    GET_CATEGORIES: "/admin/categories",
    ADD_CATEGORY: "/admin/categories",
    UPDATE_CATEGORY: (id) => `/admin/categories/${id}`,
    DELETE_CATEGORY: (id) => `/admin/categories/${id}`,

    // Coupons
    GET_COUPONS: "/admin/coupons",
    ADD_COUPON: "/admin/coupons",
    DELETE_COUPON: (id) => `/admin/coupons/${id}`,

    // Banners
    GET_BANNERS: "/admin/banners",
    ADD_BANNER: "/admin/banners",
    DELETE_BANNER: (id) => `/admin/banners/${id}`,

    // Reviews
    GET_REVIEWS: "/admin/reviews",
    UPDATE_REVIEW_STATUS: (id) => `/admin/reviews/${id}/status`,

    // Support
    GET_TICKETS: "/admin/tickets",
    UPDATE_TICKET_STATUS: (id) => `/admin/tickets/${id}/status`,

    // Shipping
    GET_SHIPPING_ZONES: "/admin/shipping-options",
    ADD_SHIPPING_ZONE: "/admin/shipping-options",
    UPDATE_SHIPPING_ZONE: (id) => `/admin/shipping-options/${id}`,
    DELETE_SHIPPING_ZONE: (id) => `/admin/shipping-options/${id}`,

    // Transactions
    GET_TRANSACTIONS: "/admin/transactions",

    // Logs
    GET_LOGS: "/admin/logs",

    // Settings
    GET_SETTINGS: "/admin/settings",
    UPDATE_SETTINGS: "/admin/settings",
};

export default API_ENDPOINT;
