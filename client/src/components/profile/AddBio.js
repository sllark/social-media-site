import React, {useState} from "react";
import Loading from "../ui/Loading";

import configs from "../../assets/config/configs";

function ProfileHeader(props) {


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

    const post = (bio)=>{

        console.log(bio)
        let link = configs.api_url;

        fetch(link + "/addBio", {
            method: "POST",
            headers: {
                "Authorization": localStorage.getItem("token"),
                "content-type": "application/json"
            },
            body: JSON.stringify({
                bio: bio,
            })
        })
            .then(resp => resp.json())
            .then(result => {


                if (result.error)
                    throw new Error(JSON.stringify(result));

                console.log(result);
                //set user bio locally
                props.updateBio(result.bio);
                setLoading(false);
                setShowInput(false);


            })
            .catch(error => {
                // let errorObject = JSON.parse(error.message);

                console.log(error)


            })


    }

    return (
        <div className="addBio d-flex flex-column flex-center">

            {
                !showInput ?
                    <button className="addBio__clickBtn btn btn--transparent noBorder" onClick={() => setShowInput(true)}>
                        {
                            props.shouldUpdate ? "Update Bio" : "Add Bio"
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


export default ProfileHeader;
