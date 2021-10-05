import React from "react";
import {Link} from "react-router-dom";


import Avatar from "../profile/Avatar";
import configs from "../../assets/config/configs";


function SidebarOnlineItem(props) {


    return (
        <Link className="sidebar__item" to={"/profile/" + props.item._id} onClick={()=>props.showSidebar(false)}>

            <Avatar isActive={true} url={props.item.profilePicture}/>
            <p>
                {`${props.item.firstName} ${props.item.lastName}`}
            </p>

        </Link>
    )


}


export default SidebarOnlineItem;
