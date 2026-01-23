import APIManager from "../api/ApiManager";
import API_ENDPOINT from "../api/ApiEndpoint";

export const adminLogin = async (data) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.LOGIN,
        data,
    });
};
