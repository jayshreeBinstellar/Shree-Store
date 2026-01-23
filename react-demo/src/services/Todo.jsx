import APIManager from "../api/ApiManager";
import API_ENDPOINT from "../api/ApiEndpoint";


export const addtodo = async (task) => {
    return await APIManager.postRequest({
        path: API_ENDPOINT.TODO,
        token: true,
        data: task
    })
};
export const updatetodo = async (id, data) => {
    return await APIManager.putRequest({
        path: API_ENDPOINT.UPDATE_TODO(id),
        data,
        token: true
    })
}
export const gettodo = async () => {
    return await APIManager.getRequest({
        path: API_ENDPOINT.GET_TODO,
        token: true
    })
}

export const deletetodo = async (id) => {
    return await APIManager.deleteRequest({
        path: API_ENDPOINT.DELETE_TODO(id),
        token: true
    })
}