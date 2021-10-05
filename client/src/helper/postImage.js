import axiosInstance from "./axios";
import handleAxiosError from "./handleAxiosError";
import axios from "axios";

const getSignedUrl = (file, props) => {


    return axiosInstance.get(
        "/getSignS3",
        {
            params: {
                fileName: Date.now() + '-' + file.name,
                fileType: file.type
            }
        })
        .then(result => {


            return result.data.result;
            // console.log(data);


        })
        .catch(error => {

            handleAxiosError(error, props.setResponsePreview, "Loading Failed...")

        })


}

const postImage = async (file, props) => {

    let signedData = await getSignedUrl(file, props);

    return axios.put(signedData.signedRequest, file)
        .then(result => {
            return signedData.url;
        })
        .catch(error => {
            handleAxiosError(error, props.setResponsePreview, "Loading Failed...")
        })


}


export { postImage}