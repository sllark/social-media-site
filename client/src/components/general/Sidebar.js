import React, {useRef} from "react";
import {Link} from "react-router-dom"
import feed from "../../assets/img/svg/menu.svg";
import personAvatar from "../../assets/img/svg/user.svg";
import friends from "../../assets/img/svg/group.svg";
import LogoutIcon from '../../assets/img/svg/exit.svg'
import useOutsideAlerter from "../../helper/useOutsideAlerter";


function Sidebar(props) {

    const wrapperRef = useRef(null);

    const logout = () => {
        localStorage.removeItem("userID");
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        props.history.push('/')
    }


    useOutsideAlerter(wrapperRef, () => {
        props.showMenu(false)
    }, '.hamburgerMenuLeft');


    return (
        <div className={"sidebar sidebarOptions" + (props.isVisible ? " showSidebar" : "")} ref={wrapperRef}>

            <div className="sidebar__container">

                <Link to="/feed" className="sidebar__item" onClick={()=>props.showMenu(false)}>
                    <img src={feed} alt="feed"/>
                    <p>
                        Feed
                    </p>
                </Link>

                <Link to={"/profile/" + localStorage.getItem("userID")} className="sidebar__item" onClick={()=>props.showMenu(false)}>
                    <img src={personAvatar} alt="personAvatar"/>
                    <p>
                        Profile
                    </p>
                </Link>

                <Link to="/friends" className="sidebar__item" onClick={()=>props.showMenu(false)}>
                    <img src={friends} alt="friends"/>
                    <p>
                        Friends
                    </p>
                </Link>

                <div className="sidebar__item logoutItem" onClick={logout}>
                    <img src={LogoutIcon} alt="Logout"/>
                    <p>
                        Logout
                    </p>
                </div>


            </div>


        </div>

    )


}


export default Sidebar;
