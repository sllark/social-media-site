import React, {useState} from "react";
import {Link} from "react-router-dom"

import timeDifference from "../../helper/timeDiff";
import Avatar from "../profile/Avatar";
import configs from "../../assets/config/configs";
import axios from "../../helper/axios";
import handleAxiosError from "../../helper/handleAxiosError";


function NotificationPopup(props) {


    const [reqAccepted, setReqAccepted] = useState(false)
    const [reqDeclined, setReqDeclined] = useState(false)

    const acceptReq = (id) => {

        axios.post(
            "/acceptFriendReq",
            JSON.stringify({
                userID: id
            }))
            .then(result => {
                if (result.data.message === "success")
                    setReqAccepted(true)
            })
            .catch(error => {
                handleAxiosError(error, props.setResponsePreview, "Could not accept request right now.")
            })


    }
    const cancelReq = (id) => {

        axios.post(
            "/declineFriendReq",
            JSON.stringify({
                userID: id
            }))
            .then(result => {
                if (result.data.message === "success")
                    setReqDeclined(true)
            })
            .catch(error => {
                handleAxiosError(error, props.setResponsePreview, "Could not decline request right now.")

            })


    }


    //TODO: make notification text a link so it take user to respective post or profile
    return (
        <div className="notificationPopup">

            {
                props.notifications.map(item => {

                    return (
                        <div className="notificationPopup__item" key={item._id}>

                            <Link to={"/profile/" + item.person._id}>
                                <Avatar
                                    url={
                                        item.person.profilePicture ?
                                            (configs.api_url + "/images/" + item.person.profilePicture) : null
                                    }
                                    roundAvatar={true}
                                />
                            </Link>

                            <div className="notificationPopup__item__content">
                                <p>
                                    {item.content}
                                </p>

                                {
                                    item.notificationType === "req" && !reqAccepted && !reqDeclined ?
                                        <ReqBtns item={item} acceptReq={acceptReq} cancelReq={cancelReq}/>
                                        : reqAccepted ? <p className="textSecondary">Request Accepted</p>
                                        : reqDeclined ? <p className="textSecondary">Request Declined</p> : null
                                }


                                <span>{timeDifference(new Date(item.date).getTime())}</span>

                            </div>

                        </div>

                    )

                })
            }
        </div>
    );

}


const ReqBtns = (props) => {
    return (
        <div className="notificationPopup__item__content__btns">
            <button
                className="btn btn--secondary"
                onClick={() => props.acceptReq(props.item.notificationPostID)}
            >
                Accept
            </button>
            <button
                className="btn btn--primary"
                onClick={() => props.cancelReq(props.item.notificationPostID)}
            >
                Decline
            </button>

        </div>
    )
}


export default NotificationPopup;
