import APIManager from "../api/ApiManager";
import API_ENDPOINT from "../api/ApiEndpoint";

export const login = async (formData) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.LOGIN,
        data: formData,
    });
};

export const register = async (formData) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.REGISTER,
        data: formData,
    })
};
