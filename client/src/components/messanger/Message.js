import React, {useState} from "react";
import {Link} from "react-router-dom"
import Avatar from "../profile/Avatar";

function Message(props) {

    const [dateVisible, changeDateVisible] = useState(false);


    if (props.msg.type === 'date') {
        return (
            <div className="message__day">
                {new Date(props.msg.date).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                })}
            </div>
        )
    }

    let profilePic = props.profile?.profilePicture;

    // if(profilePic)
    //     profilePic = configs.api_url+"/images/"+profilePic;

    return (
        <div className={props.msg.own ? "message own" : "message"} data-date={props.msg.createdAt}>
            <div className="message__body">

                <Link to={"/profile/" + props.profile?._id}>
                    <Avatar type="sm" url={profilePic}/>
                </Link>
                <pre
                    className="message__body__text"
                    onClick={() => changeDateVisible(!dateVisible)}
                >
                    {
                        props.msg.value
                    }
                </pre>
            </div>
            <div className={dateVisible ? "message__about show" : "message__about"}>
                <p>
                    {
                        formatAMPM(new Date(props.msg.createdAt))
                    }
                </p>
            </div>
        </div>
    )


}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}


export default Message;
