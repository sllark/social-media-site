import React, {useState} from "react";
import {Link} from "react-router-dom"

import timeDifference from "../../helper/timeDiff";
import Avatar from "../profile/Avatar";
import configs from "../../assets/config/configs";


function NotificationPopup(props) {


    const [reqAccepted, setReqAccepted] = useState(false)
    const [reqDeclined, setReqDeclined] = useState(false)

    const acceptReq = (id) => {

        let link = configs.api_url + "/acceptFriendReq"

        fetch(link, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify({
                userID: id
            })
        })
            .then(resp => resp.json())
            .then(result => {

                if (result.error)
                    throw new Error(JSON.stringify(result));


                console.log(result)

                if (result.message === "success")
                    setReqAccepted(true)

            })
            .catch(error => {
                // let errorObject = JSON.parse(error.message);
                console.log(error);

            })


    }
    const cancelReq = (id) => {

        let link = configs.api_url + "/declineFriendReq"

        fetch(link, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify({
                userID: id
            })
        })
            .then(resp => resp.json())
            .then(result => {

                if (result.error)
                    throw new Error(JSON.stringify(result));


                console.log(result)


                if (result.message === "success")
                    setReqDeclined(true)


            })
            .catch(error => {
                // let errorObject = JSON.parse(error.message);
                console.log(error);

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
