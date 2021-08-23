import React from "react";
import avatar from '../../assets/img/personAvatar.svg'


function Avatar(props) {

    let avatarSrc = avatar,
        type = 'sm';

    if (props.url) avatarSrc = props.url;
    if (props.type) type = props.type;

    let classes = "avatar";
    classes += " avatar-" + type

    if (props.roundAvatar)
        classes+=" b-radius-100"
    return (
        <div className={classes}>
            <img src={avatarSrc} alt={props.alt || "avatr"}/>
            {props.isActive ? <span className="online"/> : null}
        </div>
    );

}


export default Avatar;
