import React from "react";
import {Link} from "react-router-dom"
import avatar from '../../assets/img/personAvatar.svg'
import Avatar from "../profile/Avatar";
import configs from "../../assets/config/configs";


function NameDisplay(props) {

    let avatarSrc = avatar;

    if (props.user.profilePicture) avatarSrc = configs.api_url + "/images/" + props.user.profilePicture;

    return (
        <Link to={props.user._id ? ("/profile/"+props.user._id) :""} className="nameDisplay">
            <Avatar isActive={props.user.isOnline} url={avatarSrc || ""}/>
            <p>
                {props.user.firstName + " " + props.user.lastName}
            </p>
        </Link>

    );

}


export default NameDisplay;
