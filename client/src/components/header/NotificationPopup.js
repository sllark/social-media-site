import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom"


import timeDifference from "../../helper/timeDiff";
import Avatar from "../profile/Avatar";
import axios from "../../helper/axios";
import handleAxiosError from "../../helper/handleAxiosError";
import Loading from "../ui/Loading";


function NotificationPopup(props) {


    const [reqAccepted, setReqAccepted] = useState(undefined)
    const [reqDeclined, setReqDeclined] = useState(undefined)

    useEffect(() => {

    }, [])

    const acceptReq = (id, notificatitionID) => {

        axios.post(
            "/acceptFriendReq",
            JSON.stringify({
                userID: id
            }))
            .then(result => {
                if (result.data.message === "success") {
                    setReqAccepted(notificatitionID)
                    props.setRequestStatus("accepted")
                    props.hideItem(notificatitionID)
                    props.showPopup(false)
                }
            })
            .catch(error => {
                handleAxiosError(error, props.setResponsePreview, "Could not accept request right now.")
            })


    }
    const cancelReq = (id, notificatitionID) => {

        axios.post(
            "/declineFriendReq",
            JSON.stringify({
                userID: id
            }))
            .then(result => {
                if (result.data.message === "success") {
                    setReqDeclined(notificatitionID)
                    props.setRequestStatus("declined")
                    props.hideItem(notificatitionID)
                    props.showPopup(false)
                }
            })
            .catch(error => {
                handleAxiosError(error, props.setResponsePreview, "Could not decline request right now.")

            })


    }

    return (
        <div className="notificationPopup" ref={props.popupRef}>

            {
                props.notifications.map(item => {

                    let notiUrl = "/post/" + item.notificationPostID;

                    if (item.notificationType === "req")
                        notiUrl = "/profile/" + item.notificationPostID;


                    return (
                        <div className="notificationPopup__item" key={item._id}>

                            <Link to={"/profile/" + item.person._id} onClick={() => props.showPopup(false)}>
                                <Avatar
                                    url={item.person?.profilePicture}
                                    roundAvatar={true}
                                />
                            </Link>

                            <div className="notificationPopup__item__content">
                                <Link to={notiUrl} onClick={() => props.showPopup(false)}>
                                    <p>
                                        {item.content}
                                    </p>
                                </Link>


                                {
                                    item.notificationType === "req" && reqAccepted !== item._id && reqDeclined !== item._id ?
                                        <ReqBtns item={item} acceptReq={acceptReq} cancelReq={cancelReq}/>
                                        : item.notificationType === "req" && reqAccepted === item._id ?
                                        <p className="textSecondary">Request Accepted</p>
                                        : item.notificationType === "req" && reqDeclined === item._id ?
                                            <p className="textSecondary">Request Declined</p> : null
                                }


                                <span>{timeDifference(new Date(item.date).getTime())}</span>

                            </div>

                        </div>

                    )

                })
            }

            {
                props.isLoading ?
                    <Loading/> : null
            }

        </div>
    );

}


const ReqBtns = (props) => {
    return (
        <div className="notificationPopup__item__content__btns">
            <button
                className="btn btn--secondary"
                onClick={() => props.acceptReq(props.item.notificationPostID, props.item._id)}
            >
                Accept
            </button>
            <button
                className="btn btn--primary"
                onClick={() => props.cancelReq(props.item.notificationPostID, props.item._id)}
            >
                Decline
            </button>

        </div>
    )
}


export default NotificationPopup;
