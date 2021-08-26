import axios from "axios";
import configs from "../assets/config/configs";

const instance = axios.create({
    baseURL: configs.api_url,
    headers: {
        "content-type": "application/json",
        "Authorization": localStorage.getItem("token")
    }
});

export default instance;