

const handleError = (error,setResponse,customMsg)=>{

    if (error.response)
        setResponse("failed", error.response.data.message)
    else
        setResponse("failed", customMsg)

}

export default handleError;