import React from "react";
import {Link} from "react-router-dom";

import profile from "../../assets/img/profile.jpg";

function truncateString(str, num) {
    if (str.length > num) {
        return str.slice(0, num) + "...";
    } else {
        return str;
    }
}

function Person(props) {


    return (
        <Link to="/profile/" className="person">
            <img src={props.firend.profilePicUrl || profile} alt=""/>
            <div className="person__text">
                <h4 className="person__text__name">
                    {props.firend.name}
                </h4>

                <p className="person__text__bio">
                    {truncateString(props.firend.bio, 80)}
                </p>
                <p className="person__text__dob">
                    {props.firend.dob}
                </p>

            </div>


        </Link>
    );

}


export default Person;
