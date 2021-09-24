import axios from "./axios";
import handleAxiosError from "./handleAxiosError";

const getProfileDetails = (profileID) => {
    if (profileID === "") return;

    return axios.get(
        "/getProfileDetails",
        {
            params: {
                profileID: profileID
            }
        })
        .then(result => {
            return result.data.user;
        })
        .catch(error => {
            handleAxiosError(error, this.setResponsePreview, "Failed to load user data...")
        })

}


export default getProfileDetails;
