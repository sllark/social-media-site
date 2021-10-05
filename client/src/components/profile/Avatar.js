import React from "react";
import avatar from '../../assets/img/personAvatar.png'


function Avatar(props) {

    let avatarSrc = avatar,
        type = 'sm';

    if (props.url) avatarSrc = props.url;
    if (props.type) type = props.type;

    let classes = "avatar";
    classes += " avatar-" + type


    return (
        <div className={classes}>
            <img src={avatarSrc} alt={props.alt || "avatr"}/>
            {props.isActive ? <span className="online"/> : null}
            <div className="avatar__bgOverlay"/>
        </div>
    );

}


export default Avatar;
