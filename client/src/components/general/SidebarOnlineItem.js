import React from "react";
import Avatar from "../profile/Avatar";


function SidebarOnlineItem(props) {


    return (
        <div className="sidebar__item">

            <Avatar isActive={true} url={props.item.profilePicUrl}/>
            <p>
                {props.item.name}
            </p>

        </div>
    )


}


export default SidebarOnlineItem;
