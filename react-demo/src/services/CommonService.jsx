import axios from "axios";
import API_ENDPOINT from "../api/ApiEndpoint";

export const getCountries = async () => {
    // Direct axios call or fetch since it's external and might not need the same interceptors/base url logic if ApiManager forces it.
    // However, ApiManager uses a base URL.
    // If we use APIManager, it pre-pends BASE_URL.
    // So we should just use axios or fetch directly here, but encapsulated in service.
    try {
        const response = await axios.get(API_ENDPOINT.COUNTRIES);
        return response.data;
    } catch (error) {
        console.error("Error fetching countries", error);
        return [];
    }
};
