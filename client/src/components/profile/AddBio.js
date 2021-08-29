import React, {useState} from "react";
import Loading from "../ui/Loading";

import axios from "../../helper/axios";
import handleAxiosError from "../../helper/handleAxiosError";

function AddBio(props) {


    const [bio, setBio] = useState("");
    const [showInput, setShowInput] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const postBio = () => {

        if (bio === "") setShowInput(false);
        else {
            setLoading(true);
            post(bio);
        }
    }

    const post = (bio) => {

        axios.post(
            "/addBio",
            JSON.stringify({bio: bio}))
            .then(result => {
                //set user bio locally
                props.updateBio(result.data.bio);

            })
            .catch(error => {
                handleAxiosError(error,props.setResponsePreview,"Failed to update bio...")
            })
            .then(()=>{
                setLoading(false);
                setShowInput(false);
            })


    }

    return (
        <div className="addBio d-flex flex-column flex-center">

            {
                !showInput ?
                    <button className="addBio__clickBtn btn btn--transparent noBorder"
                            onClick={() => setShowInput(true)}>
                        {
                            props.haveBio ? "Update Bio" : "Add Bio"
                        }
                    </button>
                    : null
            }

            {
                showInput && !isLoading ?
                    <div className="addBio__inputBox d-flex">

                        <input type="text" onChange={e => setBio(e.target.value)}/>
                        <button className="btn btn--primary" onClick={postBio}>Save</button>

                    </div>
                    : null
            }

            {
                isLoading ? <Loading/> : null
            }


        </div>
    );

}


export default AddBio;
