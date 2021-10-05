import React from "react";
import {Link} from "react-router-dom";

import configs from "../../assets/config/configs";

import profile from "../../assets/img/personAvatar.png";

function truncateString(str, num) {
    if (str?.length > num) {
        return str.slice(0, num) + "...";
    } else {
        return str;
    }
}

function Person(props) {

    let profileUrl = "";
    profileUrl = props.user.profilePicture || profile;

    return (
        <Link to={"/profile/"+props.user._id} className="person">
            <img src={profileUrl} alt=""/>
            <div className="person__text">
                <h4 className="person__text__name">
                    {props.user.firstName + " " + props.user.lastName}
                </h4>

                <p className="person__text__bio">
                    {truncateString(props.user.bio, 80)}
                </p>
                <p className="person__text__dob">
                    {props.user.dob}
                </p>

            </div>


        </Link>
    );

}


export default Person;
