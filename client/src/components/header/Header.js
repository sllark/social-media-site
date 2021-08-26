import React, {useEffect, useRef, useState} from "react";
import {Link, Redirect} from "react-router-dom"

import NotificationPopup from "./NotificationPopup";

import useOutsideAlerter from "../../helper/useOutsideAlerter";

import logo from '../../assets/img/logo-icon.png'
import {ReactComponent as LogoutIcon} from '../../assets/img/svg/exit.svg'
import {ReactComponent as NotificationIcon} from '../../assets/img/svg/bell.svg'
import {ReactComponent as SearchIcon} from '../../assets/img/svg/search.svg'
import configs from "../../assets/config/configs";
import axios from "../../helper/axios";


function Header(props) {

    const [value, changeValue] = useState("");
    const [isFocused, changeFocused] = useState(false);
    const [redirect, changeRedirect] = useState(null);
    const [notifiPopup, setNotifiPopup] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const wrapperRef = useRef(null);

    useEffect(() => {
        document.addEventListener('keyup', searchOnEnter)
        getNotifications();


        return () => {
            document.removeEventListener('keyup', searchOnEnter)
        };

    }, [])

    useOutsideAlerter(wrapperRef, () => {
        setNotifiPopup(false)
    });

    const searchEvent = (e) => {
        if (value.trim().length < 1) return;
        let query = '/search?q=' + value.trim();
        changeRedirect(query);
    }

    const searchOnEnter = (e) => {
        if (e.keyCode === 13) searchEvent();
    }


    const getNotifications = () => {

        axios.get("/getNotifications")
            .then(result => {
                setNotifications(result.data.notifications)
            })
            .catch(error => {
                console.log(error);
            })

    }


    if (redirect) {
        return <Redirect to={redirect}/>
    }


    return (
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
                           value={value}
                           onChange={e => {
                               changeValue(e.target.value)
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
                                <NotificationPopup notifications={notifications}/>

                                : null

                        }

                    </div>

                    <div className="header__controls__container">
                        <LogoutIcon/>
                    </div>


                </div>
            </div>

        </div>
    );

}


export default Header;
