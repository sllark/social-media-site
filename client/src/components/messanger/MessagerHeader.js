import React from "react";
import {Link} from "react-router-dom"
import Avatar from "../profile/Avatar";

function MessagerHeader(props) {

    let profilePic = props.user?.profilePicture;

    // if (profilePic)
    //     profilePic = configs.api_url + "/images/" + profilePic;

    return (
        <div className="messagerHeader">
            <div className="messagerHeader__body">

                <Link to={"/profile/" + props.user?._id}>
                    <Avatar type="sm" url={profilePic} isActive={props.user?.isOnline}/>
                </Link>

                <div className="messagerHeader__body__text">


                    <p>
                        {
                            `${props.user?.firstName} ${props.user?.lastName}`
                        }
                    </p>

                    <span className={props.isTyping ? "typing" : ""}>
                       {
                           props.isTyping ? "typing..." :
                               props.user?.isOnline ? "Online" : ""
                       }
                   </span>


                </div>

            </div>
        </div>
    )


}


export default MessagerHeader;
