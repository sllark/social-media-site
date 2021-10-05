import React from "react";
import {Link} from "react-router-dom";


import Avatar from "../profile/Avatar";
import configs from "../../assets/config/configs";


function SidebarChatItem(props) {


    return (
        <Link
            className={"sidebar__item" + (props.currentChat === props.item._id ? " active" : "")}
            to={"/messanger/" + props.item._id}
            onClick={() => props.showSidebar(false)}>

            <Avatar isActive={props.item.isOnline} url={props.item?.profilePicture}/>


            <div className="sidebar__item__content">


                <p>
                    {`${props.item.firstName} ${props.item.lastName}`}
                </p>

                <span>{props.item.lastMessage.substring(0,14)}</span>

            </div>

            {
                props.item.unRead ?
                    <span className="sidebar__item__unRead">
                        {
                            props.item.unRead < 100 ? props.item.unRead : "99+"
                        }
                    </span>
                    : null
            }

        </Link>
    )


}


export default SidebarChatItem;
