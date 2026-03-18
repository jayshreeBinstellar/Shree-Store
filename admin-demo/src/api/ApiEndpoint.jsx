
const API_ENDPOINT = {
  // Auth
  LOGIN: "/auth/login",
  FORGOT_PASSWORD_API: "/auth/password/forget",// NOSONAR
  VERIFY_OTP: "/auth/verify-otp",
  RESET_PASSWORD_API: "/auth/password/reset",// NOSONAR
  RESEND_OTP: "/auth/resend-otp",

  // Profile & Logout
  PROFILE: "/auth/profile",
  UPDATE_PROFILE: "/auth/edit-profile",
  LOGOUT: "/auth/logout",
  CHANGE_PASSWORD_API: "/auth/password/change",// NOSONAR

  // Dashboard
  GET_STATS: "/admin/stats", //yes

  // Products //done
  GET_PRODUCTS: "/admin/products",
  ADD_PRODUCT: "/admin/products",
  BULK_ADD_PRODUCTS: "/admin/products/bulk",

  // DELETE_PRODUCT: (id) => `/admin/products/${id}`,
  TOGGLE_PRODUCT_STATUS: (id) => `/admin/products/${id}/status`,
  SOFT_DELETE_PRODUCT: (id) => `/admin/products/${id}/soft`,
  RESTORE_PRODUCT: (id) => `/admin/products/restore/${id}`,
  BULK_RESTORE: '/admin/products/bulk-restore',

  UPDATE_PRODUCT: (id) => `/admin/products/${id}`,

  // Orders //check
  GET_ORDERS: "/admin/orders",
  UPDATE_ORDER_STATUS: (id) => `/admin/orders/${id}/status`,

  // Customers //done
  GET_CUSTOMERS: "/admin/customers",
  ADD_CUSTOMER: "/admin/customers",
  UPDATE_CUSTOMER_ROLE: (id) => `/admin/customers/${id}/role`,
  TOGGLE_CUSTOMER_BLOCK: (id) => `/admin/customers/${id}/block`,

  // Categories //done
  GET_CATEGORIES: "/admin/categories",
  ADD_CATEGORY: "/admin/categories",
  UPDATE_CATEGORY: (id) => `/admin/categories/${id}`,
  DELETE_CATEGORY: (id) => `/admin/categories/${id}`,

  // Coupons //done
  GET_COUPONS: "/admin/coupons",
  ADD_COUPON: "/admin/coupons",
  DELETE_COUPON: (id) => `/admin/coupons/${id}`,

  // Banners //check
  GET_BANNERS: "/admin/banners",
  ADD_BANNER: "/admin/banners",
  UPDATE_BANNER: (id) => `/admin/banners/${id}`,
  DELETE_BANNER: (id) => `/admin/banners/${id}`,
  UPLOAD_BANNER_IMAGE: "/admin/upload-banner-image",
  UPLOAD_PRODUCT_IMAGE: "/admin/upload-product-image",

  // Reviews //done
  GET_REVIEWS: "/admin/reviews",
  UPDATE_REVIEW_STATUS: (id) => `/admin/reviews/${id}/status`,

  // Support //done
  GET_TICKETS: "/admin/tickets",
  UPDATE_TICKET_STATUS: (id) => `/admin/tickets/${id}/status`,

  // Shipping //done
  GET_SHIPPING_ZONE: "/admin/shipping-options",
  ADD_SHIPPING_ZONE: "/admin/shipping-options",
  UPDATE_SHIPPING_ZONE: (id) => `/admin/shipping-options/${id}`,
  DELETE_SHIPPING_ZONE: (id) => `/admin/shipping-options/${id}`,
  UPDATE_ORDER_SHIPPING: (id) => `/admin/orders/${id}/shipping`,
  // Transactions //done
  GET_TRANSACTIONS: "/admin/transactions",

  // Logs //done
  GET_LOGS: "/admin/logs",

  // Settings //done
  GET_SETTINGS: "/admin/settings",
  UPDATE_SETTINGS: "/admin/settings",



};

export default API_ENDPOINT;
