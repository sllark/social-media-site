import axios from "axios";
import configs from "../assets/config/configs";

const instance = axios.create({
    baseURL: configs.api_url,
    headers: {
        "content-type": "application/json",
    }
});

instance.interceptors.request.use((config) => {
    config.headers.Authorization = localStorage.getItem("token")
    return config
}, (err) => {
    console.log(err)
    return Promise.reject(err)
})
export default instance;