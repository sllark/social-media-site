import React, {useState} from "react";
import SidebarOnlineItem from "./SidebarOnlineItem";

function Sidebar(props) {

    let items = [
        {
            name: "AbdulRehman",
            profileUrl: "",
            profilePicUrl: "",
        },
        {
            name: "AbdulRehman",
            profileUrl: "",
            profilePicUrl: "",
        },
        {
            name: "AbdulRehman",
            profileUrl: "",
            profilePicUrl: "",
        },
        {
            name: "AbdulRehman",
            profileUrl: "",
            profilePicUrl: "",
        },
        {
            name: "AbdulRehman",
            profileUrl: "",
            profilePicUrl: "",
        },
        {
            name: "AbdulRehman",
            profileUrl: "",
            profilePicUrl: "",
        }
    ]

    const [sidebar, changeSidebar] = useState(false)
    const [sidebarItems, changeSidebarItems] = useState(items)

    return (

        <div
            className={
                "sidebar sidebarOnline" +
                (sidebar ? " scrollbarVisible" : "")
            }
            onMouseEnter={event => changeSidebar(true)}
            onMouseLeave={event => changeSidebar(false)}
        >

            <div className="sidebar__container">

                <h2 className="sidebarHeading">Contacts</h2>

                {sidebarItems.map((item, index) => {
                    return <SidebarOnlineItem
                        key={item.name + index}
                        item={item}/>
                })}

            </div>


        </div>

    )


}


export default Sidebar;
