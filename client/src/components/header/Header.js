import React, {useEffect, useRef, useState} from "react";
import {Link, Redirect} from "react-router-dom"

import axios from "../../helper/axios";
import useOutsideAlerter from "../../helper/useOutsideAlerter";

import NotificationPopup from "./NotificationPopup";
import ShowResponse from "../ui/ShowResponse";


import logo from '../../assets/img/logo-icon.png'
import {ReactComponent as LogoutIcon} from '../../assets/img/svg/exit.svg'
import {ReactComponent as NotificationIcon} from '../../assets/img/svg/bell.svg'
import {ReactComponent as SearchIcon} from '../../assets/img/svg/search.svg'
import handleAxiosError from "../../helper/handleAxiosError";


function Header(props) {
    //TODO: lazy-load notifications


    const [queryValue, changeQueryValue] = useState("");
    const [isFocused, changeFocused] = useState(false);
    const [redirect, changeRedirect] = useState(null);
    const [notifiPopup, setNotifiPopup] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const [responseStatus, setResponseStatus] = useState("");
    const [responseMsg, setResponseMsg] = useState("");


    const wrapperRef = useRef(null);

    useEffect(() => {
        document.addEventListener('keyup', searchOnEnter)
        getNotifications();
        let query = getQuery(props.history.location.search);
        changeQueryValue(query || "");

        return () => {
            document.removeEventListener('keyup', searchOnEnter)
        };

    }, [])


    useEffect(() => {

        if (props.notification) {

            if (!props.notification.notification._id) return;

            let prevNoti = [...notifications]

            let filtered = prevNoti.filter(noti => noti._id !== props.notification.notification._id)

            if (filtered.length === prevNoti.length) {
                setNotifications([props.notification.notification, ...notifications])
                console.log('in 1')

                let type = props.notification.eventType;
                if (type === "postShared" || type === "req") {
                    console.log('in')
                    setResponsePreview("message", props.notification.notification.content)
                }

            } else if (filtered.length < prevNoti.length)
                setNotifications(filtered)


        }

    }, [props.notification])


    useOutsideAlerter(wrapperRef, () => {
        setNotifiPopup(false)
    });

    let searchEvent = () => {
        if (queryValue.trim().length < 1) return;
        let query = '/search?q=' + queryValue.trim();
        props.history.push(query)
    }

    const searchOnEnter = (e) => {
        // if (e.keyCode === 13) searchEvent();
    }


    const getNotifications = () => {

        axios.get("/getNotifications")
            .then(result => {
                setNotifications(result.data.notifications)
            })
            .catch(error => {
                handleAxiosError(error, setResponsePreview, "Notifications Loading Failed...")
            })

    }

    const hideItem = (id) => {
        //TODO: refresh page or update profile/friend page if it is opened
        let notifi = notifications.filter(item => item._id !== id)
        setNotifications(notifi)
    }

    const logout = () => {
        localStorage.removeItem("userID");
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        changeRedirect('/')
    }


    const getQuery = (locationQuery) => {
        let params = new URLSearchParams(locationQuery);
        return params.get('q');
    }

    const setResponsePreview = (status, msg) => {
        setResponseMsg(msg)
        setResponseStatus(status)
    }


    if (redirect) {
        return <Redirect to={redirect}/>
    }


    return (
        <>
            {responseStatus !== "" ?
                <ShowResponse
                    status={responseStatus}
                    message={responseMsg}
                    hideMe={() => setResponseStatus("")}
                />
                : null
            }
            <div className="header">
                <div className="header__container">

                    <div className={"hamburgerMenu hamburgerMenuLeft" + (props.menuLeftOpen ? " makeCross" : "")}
                         onClick={() => props.setMenuLeftOpen(!props.menuLeftOpen)}>
                        <div className="bar1"/>
                        <div className="bar2"/>
                        <div className="bar3"/>
                    </div>


                    <Link to="/" className="header__logo">
                        <img src={logo} alt="logo"/>
                    </Link>


                    <div className={
                        "header__searchbar" +
                        (isFocused ? " focused" : "")
                    }>


                        <input type="text"
                               placeholder="Search"
                               value={queryValue}
                               onChange={e => {
                                   // console.log(e.target.value)
                                   changeQueryValue(e.target.value)
                               }}
                               onFocus={() => changeFocused(true)}
                               onBlur={() => changeFocused(false)}
                        />

                        <button
                            onClick={searchEvent}
                        >
                            <SearchIcon/>
                        </button>


                    </div>

                    <div className="header__controls">


                        <div className="header__controls__container" ref={wrapperRef}>

                            <NotificationIcon onClick={() => setNotifiPopup(!notifiPopup)}/>

                            {
                                notifiPopup ?
                                    <NotificationPopup
                                        notifications={notifications}
                                        setResponsePreview={setResponsePreview}
                                        showPopup={setNotifiPopup}
                                        hideItem={hideItem}
                                        setRequestStatus={props.setRequestStatus}
                                    />
                                    : null

                            }

                        </div>

                        <div className="header__controls__container logoutCont">
                            <LogoutIcon onClick={logout}/>
                        </div>


                    </div>


                    <div className={"hamburgerMenu hamburgerMenuRight" + (props.menuRightOpen ? " makeCross" : "")}
                         onClick={() => props.setMenuRightOpen(!props.menuRightOpen)}>
                        <div className="bar1"/>
                        <div className="bar2"/>
                        <div className="bar3"/>
                    </div>

                </div>

            </div>
        </>
    );

}


export default Header;
