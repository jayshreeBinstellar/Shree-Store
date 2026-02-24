
const API_ENDPOINT = {

    LOGIN: "/auth/login",
    REGISTER: "/auth/register",

    // User / Profile
    PROFILE: "/auth/profile", //
    ADDRESSES: "/auth/addresses",//twice
    ADDRESS_DETAIL: (id) => `/auth/addresses/${id}`,//

    // Products
    PRODUCTS: "/shop/products",
    PRODUCT_DETAIL: (id) => `/shop/products/${id}`,
    RELATED_PRODUCTS: (id) => `/shop/products/${id}/related`,
    PRODUCT_REVIEWS: (id) => `/shop/products/${id}/reviews`,

    // Cart / Orders / Wishlist
    CART: "/shop/cart",
    ORDER_HISTORY: "/shop/orders/history", //
    WISHLIST: "/shop/wishlist",//twice
    WISHLIST_DETAIL: (id) => `/shop/wishlist/${id}`,
    CHECKOUT: "/shop/checkout",
    SHIPPING_OPTIONS: "/shop/shipping-options",
    VALIDATE_COUPON: "/shop/coupons/validate",
    ORDER: "/shop/orders",
    VERIFY_PAYMENT: "/shop/orders/verify-payment",
    SHOP_SETTINGS: "/shop/settings",

    //banner
    BANNERS: "/shop/banners",

    //categories
    CATEGORIES: "/shop/categories",

    // Support/Tickets
    SUPPORT_TICKETS: "/shop/support/tickets",
    SUPPORT_TICKET_DETAIL: (id) => `/shop/support/tickets/${id}`,
    SUPPORT_TICKET_REPLIES: (id) => `/shop/support/tickets/${id}/replies`,
    SUPPORT_CATEGORIES: "/shop/support/categories",

}

export default API_ENDPOINT;