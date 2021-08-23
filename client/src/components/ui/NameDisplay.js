import React from "react";
import avatar from '../../assets/img/personAvatar.svg'
import Avatar from "../profile/Avatar";


function NameDisplay(props) {

    let avatarSrc = avatar;

    if(props.url) avatarSrc = props.url;

    return (
        <div className="nameDisplay">
            <Avatar isActive={props.isActive} url={avatarSrc || ""}/>
            <p>
                {props.name}
            </p>
        </div>

    );

}


export default NameDisplay;
