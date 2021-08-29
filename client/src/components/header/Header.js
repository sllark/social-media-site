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


function Header(props) {

    const [queryValue, changeQueryValue] = useState("da");
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
        changeQueryValue(query);

        return () => {
            document.removeEventListener('keyup', searchOnEnter)
        };

    }, [])

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
                console.log(error);

                if (error.response)
                    setResponsePreview("failed", error.response.data.message)
                else
                    setResponsePreview("failed", "Notifications Loading Failed...")
            })

    }

    const logout = () => {
        localStorage.removeItem("userID");
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        changeRedirect('/')
    }

    if (redirect) {
        return <Redirect to={redirect}/>
    }

    const getQuery = (locationQuery)=>{
        let params = new URLSearchParams(locationQuery);
        return params.get('q');
    }

    const setResponsePreview = (status, msg) => {
        setResponseMsg(msg)
        setResponseStatus(status)
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
                                    <NotificationPopup notifications={notifications}
                                                       setResponsePreview={setResponsePreview}/>

                                    : null

                            }

                        </div>

                        <div className="header__controls__container">
                            <LogoutIcon onClick={logout}/>
                        </div>


                    </div>
                </div>

            </div>
        </>
    );

}


export default Header;
