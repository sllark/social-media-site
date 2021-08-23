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

    // let abc =
    //     [
    //     {
    //         name: "Howard Beach",
    //         bio: "ipsum. Curabitur consequat, lectus sit amet luctus vulputate,",
    //         dob: "Jun 5, 2005",
    //         profileUrl: "",
    //         profilePicUrl: ""
    //     },
    //     {
    //         name: "Bernard Jefferson",
    //         bio: "facilisis. Suspendisse commodo tincidunt nibh. Phasellus nulla. Integer dob:vulputate, risus",
    //         dob: "Jul 2, 2017",
    //         profileUrl: "",
    //         profilePicUrl: ""
    //     },
    //     {
    //         name: "Urielle Mejia",
    //         bio: "bibendum sed, est.",
    //         dob: "Sep 23, 1988",
    //         profileUrl: "",
    //         profilePicUrl: ""
    //     },
    //     {
    //         name: "Hanae Christensen",
    //         bio: "ipsum. Suspendisse sagittis. Nullam vitae diam. Proin",
    //         dob: "Apr 15, 2013",
    //         profileUrl: "",
    //         profilePicUrl: ""
    //     },
    //     {
    //         name: "Slade Patton",
    //         bio: "molestie orci tincidunt",
    //         dob: "Aug 13, 1998",
    //         profileUrl: "",
    //         profilePicUrl: ""
    //     },
    //     {
    //         name: "Ulric Aguirre",
    //         bio: "sit amet, consectetuer adipiscing elit. Curabitur",
    //         dob: "Oct 9, 2003",
    //         profileUrl: "",
    //         profilePicUrl: ""
    //     },
    //     {
    //         name: "Silas Burt",
    //         bio: "placerat. Cras dictum ultricies ligula. Nullam",
    //         dob: "Jun 7, 1988",
    //         profileUrl: "",
    //         profilePicUrl: ""
    //     },
    //     {
    //         name: "Kenyon Dean",
    //         bio: "Cras dictum",
    //         dob: "Jul 2, 2017",
    //         profileUrl: "",
    //         profilePicUrl: ""
    //     },
    //     {
    //         name: "Addison Mckenzie",
    //         bio: "Quisque purus sapien,",
    //         dob: "Jul 30, 2003",
    //         profileUrl: "",
    //         profilePicUrl: ""
    //     },
    //     {
    //         name: "Hedley Branch",
    //         bio: "auctor quis, tristique ac,",
    //         dob: "Apr 25, 1989",
    //         profileUrl: "",
    //         profilePicUrl: ""
    //     },
    //     {
    //         name: "Constance Byers",
    //         bio: "nunc sed pede. Cum sociis natoque penatibus et magnis dis",
    //         dob: "Apr 23, 1992",
    //         profileUrl: "",
    //         profilePicUrl: ""
    //     },
    // ]


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
