import React from "react";
import {Link} from "react-router-dom";


import Avatar from "../profile/Avatar";
import configs from "../../assets/config/configs";


function SidebarChatItem(props) {


    return (
        <Link className="sidebar__item" to={"/messanger/" + props.item._id} onClick={()=>props.showSidebar(false)}>

            <Avatar isActive={props.item.isOnline} url={configs.api_url + "/images/" + props.item.profilePicture}/>
            <p>
                {`${props.item.firstName} ${props.item.lastName}`}
            </p>

        </Link>
    )


}


export default SidebarChatItem;
