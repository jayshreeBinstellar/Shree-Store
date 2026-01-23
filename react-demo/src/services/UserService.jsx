import APIManager from "../api/ApiManager";
import API_ENDPOINT from "../api/ApiEndpoint";

export const getProfile = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.PROFILE,
        token: true
    });
};

export const getAddresses = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.ADDRESSES,
        token: true
    });
};

export const addAddress = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.ADDRESSES,
        data,
        token: true
    });
};

export const deleteAddress = async (id) => {
    return await APIManager.deleteRequest({
        path: API_ENDPOINT.ADDRESS_DETAIL(id),
        token: true
    });
};

export const getOrders = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.ORDER_HISTORY,
        token: true
    });
};

export const getWishlist = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.WISHLIST,
        token: true
    });
};

export const addToWishlist = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.WISHLIST,
        data,
        token: true
    });
};

export const removeFromWishlist = async (id) => {
    return await APIManager.deleteRequest({
        path: API_ENDPOINT.WISHLIST_DETAIL(id),
        token: true
    });
};
