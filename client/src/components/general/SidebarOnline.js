import React, {useEffect, useState} from "react";
import SidebarOnlineItem from "./SidebarOnlineItem";
import axios from "../../helper/axios";

function Sidebar(props) {

    const [sidebar, setSidebar] = useState(false)
    const [sidebarItems, setSidebarItems] = useState([])

    useEffect(() => {

        axios.get("/getOnlineFriends")
            .then(result => {
                setSidebarItems(result.data.friends);
            })
            .catch(error => {
                console.log(error);

                if (error.response)
                    this.props.setResponsePreview("failed", error.response.data.message)
                else
                    this.props.setResponsePreview("failed", "Failed to load online friends...")

            })

    }, [])

    return (

        <div
            className={
                "sidebar sidebarOnline" +
                (sidebar ? " scrollbarVisible" : "")
            }
            onMouseEnter={event => setSidebar(true)}
            onMouseLeave={event => setSidebar(false)}
        >

            <div className="sidebar__container">

                <h2 className="sidebarHeading">Contacts</h2>

                {sidebarItems.map((item, index) => {
                    return <SidebarOnlineItem
                        key={item._id}
                        item={item}/>
                })}

            </div>


        </div>

    )


}


export default Sidebar;
