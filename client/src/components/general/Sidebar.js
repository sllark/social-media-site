import React from "react";
import {Link} from "react-router-dom"
import feed from "../../assets/img/svg/menu.svg";
import personAvatar from "../../assets/img/svg/user.svg";
import friends from "../../assets/img/svg/group.svg";


function Sidebar(props) {


    return (
        <div className="sidebar">

            <div className="sidebar__container">

                <Link to="/feed" className="sidebar__item">
                    <img src={feed} alt="feed"/>
                    <p>
                        Feed
                    </p>
                </Link>

                <Link to={"/profile/"+localStorage.getItem("userID")} className="sidebar__item">
                    <img src={personAvatar} alt="personAvatar"/>
                    <p>
                        Profile
                    </p>
                </Link>

                <Link to="/friends" className="sidebar__item">
                    <img src={friends} alt="friends"/>
                    <p>
                        Friends
                    </p>
                </Link>


            </div>


        </div>

    )


}


export default Sidebar;
