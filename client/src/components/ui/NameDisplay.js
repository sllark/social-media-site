import React from "react";
import {Link} from "react-router-dom"
import avatar from '../../assets/img/personAvatar.svg'
import Avatar from "../profile/Avatar";


function NameDisplay(props) {

    let avatarSrc = props.user?.profilePicture || avatar;

    return (
        <Link to={props.user._id ? ("/profile/" + props.user._id) : ""} className="nameDisplay">
            <Avatar isActive={props.user.isOnline || props.user._id === localStorage.getItem("userID")}
                    url={avatarSrc || ""}/>
            <p>
                {props.user.firstName + " " + props.user.lastName}
            </p>
        </Link>

    );

}


export default NameDisplay;
