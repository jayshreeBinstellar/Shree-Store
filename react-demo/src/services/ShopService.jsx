import APIManager from "../api/ApiManager";
import API_ENDPOINT from "../api/ApiEndpoint";

export const getProducts = async (query = "") => {
    return await APIManager.getRequest({
        path: `${API_ENDPOINT.PRODUCTS}${query ? `?${query}` : ""}`,
    });
};

export const getProduct = async (id) => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.PRODUCT_DETAIL(id),
    });
};

export const getRelatedProducts = async (id) => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.RELATED_PRODUCTS(id),
    });
};

export const getReviews = async (id) => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.PRODUCT_REVIEWS(id),
    });
};

export const addReview = async (id, data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.PRODUCT_REVIEWS(id),
        data: data,
        token: true
    });
};

export const checkout = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.CHECKOUT,
        data: data,
        token: true
    });
};

export const verifyPayment = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.VERIFY_PAYMENT,
        data: data,
        token: true
    });
};

export const getShippingOptions = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.SHIPPING_OPTIONS,
    });
};

export const getStoreSettings = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.SHOP_SETTINGS,
    });
};

export const validateCoupon = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.VALIDATE_COUPON,
        data: data
    });
};

export const getBanners = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.BANNERS,
    });
};

export const getCategories = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.CATEGORIES,
    });
};

export const getCart = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.CART,
    });
};

export const addToCart = async (productId, quantity = 1) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.CART,
        data: { productId, quantity },
    });
};

export const updateCartItem = async (productId, quantity) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.CART,
        data: { productId, quantity },
    });
};

export const removeFromCart = async (productId) => {
    return await APIManager.deleteRequest({
        path: `${API_ENDPOINT.CART}/${productId}`,
    });
};
