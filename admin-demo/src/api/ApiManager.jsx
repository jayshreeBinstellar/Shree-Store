import axios from "axios";
import BASE_URL from "./ApiConstant";

const api = axios.create({
    baseURL: BASE_URL,
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        config.headers["Accept"] = "application/json";
        if (!(config.data instanceof FormData)) {
            config.headers["Content-Type"] = "application/json";
        } else {
            // Let browser set Content-Type with boundary for FormData
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//logout user
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && error.config?.headers?.Authorization) {
            console.warn("Unauthorized - logging out");
            localStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);


const getToken = () => localStorage.getItem("token");
const buildHeaders = (token = getToken(), isFormData = false) => {
    const headers = {
        Accept: "application/json",
    };

    // Only set Content-Type if NOT FormData (browser handles it automatically)
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return headers;
};
class APIManager {
    static async getRequest({ path, token = null }) {
        try {
            const response = await api.get(path, {
                headers: buildHeaders(token),
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            const res = error.response;
            throw {
                status: res?.status || 500,
                message:
                    res?.data?.message ||
                    res?.data?.error ||
                    res?.statusText ||
                    "Something went wrong",
                data: res?.data || {},
            };
        }
    }

    static async postRequest({ path, data, token = null }) {
        try {
            const isFormData = data instanceof FormData;
            const response = await api.post(path, data, {
                headers: buildHeaders(token, isFormData),
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            const res = error.response;
            throw {
                status: res?.status || 500,
                message:
                    res?.data?.message ||
                    res?.data?.error ||
                    res?.statusText ||
                    "Something went wrong",
                data: res?.data || {},
            };
        }
    }

    static async putRequest({ path, data, token = null, isMultipart = false }) {
        try {
            const isFormData = isMultipart || data instanceof FormData;
            const response = await api.put(path, data, {
                headers: buildHeaders(token, isFormData),
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            const res = error.response;
            throw {
                status: res?.status || 500,
                message:
                    res?.data?.message ||
                    res?.data?.error ||
                    res?.statusText ||
                    "Something went wrong",
                data: res?.data || {},
            };
        }
    }

    static async deleteRequest({ path, data = {}, token = null }) {
        try {
            const isFormData = data instanceof FormData;
            const response = await api.delete(path, {
                headers: buildHeaders(token, isFormData),
                data,
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            const res = error.response;
            throw {
                status: res?.status || 500,
                message:
                    res?.data?.message ||
                    res?.data?.error ||
                    res?.statusText ||
                    "Something went wrong",
                data: res?.data || {},
            };
        }
    }
}

export default APIManager;
