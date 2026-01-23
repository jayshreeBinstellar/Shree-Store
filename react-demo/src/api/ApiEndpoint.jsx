
const API_ENDPOINT = {

    LOGIN: "/auth/login",
    REGISTER: "/auth/register",

    // User / Profile
    PROFILE: "/auth/profile",
    ADDRESSES: "/auth/addresses",
    ADDRESS_DETAIL: (id) => `/auth/addresses/${id}`,

    // Products
    PRODUCTS: "/shop/products",
    PRODUCT_DETAIL: (id) => `/shop/products/${id}`,
    RELATED_PRODUCTS: (id) => `/shop/products/${id}/related`,
    PRODUCT_REVIEWS: (id) => `/shop/products/${id}/reviews`,

    // Cart / Orders / Wishlist
    CART: "/shop/cart",
    ORDER_HISTORY: "/shop/orders/history",
    WISHLIST: "/shop/wishlist",
    WISHLIST_DETAIL: (id) => `/shop/wishlist/${id}`,
    CHECKOUT: "/shop/checkout",
    SHIPPING_OPTIONS: "/shop/shipping-options",
    VALIDATE_COUPON: "/shop/coupons/validate",
    ORDER: "/shop/orders",
    VERIFY_PAYMENT: "/shop/orders/verify-payment",


    // Todo
    TODO: "/auth/todo",
    UPDATE_TODO: (id) => `/auth/updatetodo?id=${id}`,
    GET_TODO: "/auth/gettodo",
    DELETE_TODO: (id) => `/auth/deletetodo?id=${id}`,

    //banner
    BANNERS: "/shop/banners",

    //categories
    CATEGORIES: "/shop/categories",

    // Support/Tickets
    SUPPORT_TICKETS: "/shop/support/tickets",
    SUPPORT_TICKET_DETAIL: (id) => `/shop/support/tickets/${id}`,
    SUPPORT_TICKET_REPLIES: (id) => `/shop/support/tickets/${id}/replies`,
    SUPPORT_CATEGORIES: "/shop/support/categories",

    // External
    COUNTRIES: "https://restcountries.com/v3.1/all?fields=name",

}

export default API_ENDPOINT;