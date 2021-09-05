import React, {useEffect, useRef, useState} from "react";
import SidebarOnlineItem from "./SidebarOnlineItem";
import axios from "../../helper/axios";
import ShowResponse from "../ui/ShowResponse";
import useOutsideAlerter from "../../helper/useOutsideAlerter";

function SidebarOnline(props) {
    const wrapperRef = useRef(null);

    const [sidebar, setSidebar] = useState(false)
    const [sidebarItems, setSidebarItems] = useState([])

    const [responseStatus, setResponseStatus] = useState("");
    const [responseMsg, setResponseMsg] = useState("");

    useEffect(() => {

        axios.get("/getOnlineFriends")
            .then(result => {
                setSidebarItems(result.data.friends);
            })
            .catch(error => {
                console.log(error);

                if (error.response)
                    setResponsePreview("failed", error.response.data.message)
                else
                    setResponsePreview("failed", "Failed to load online friends...")

            })

    }, [])

    useEffect(() => {

        if (!props.onlineUser) return;

        const findIndex = sidebarItems.findIndex(item => item._id === props.onlineUser._id);

        if (findIndex < 0) {
            setSidebarItems([...sidebarItems, props.onlineUser]);
            // setResponseStatus('message')
            // setResponseMsg(`${props.onlineUser.firstName} is Online.`)
            props.removeUser(props.onlineUser._id,"usersOnline");
        }
    }, [props.onlineUser])

    useEffect(() => {

        if (!props.offlineUser) return;

        const findIndex = sidebarItems.findIndex(item => item._id === props.offlineUser._id);

        if (findIndex >= 0) {
            let items = [...sidebarItems];

            items.splice(findIndex,1);
            setSidebarItems(items);

            // setResponseStatus('message')
            // setResponseMsg(`${props.offlineUser.firstName} is Ofline.`)
            props.removeUser(props.offlineUser._id,"usersOffline");
        }
    }, [props.offlineUser])


    useOutsideAlerter(wrapperRef, () => {
        props.showMenu(false)
    }, '.hamburgerMenuRight');

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


            <div
                className={
                    "sidebar sidebarOnline" +
                    (sidebar ? " scrollbarVisible" : "") +
                    (props.isVisible ? " showSidebar" : "") +
                    (props.hideSidebarLG ? " hideSidebarLG" : "")
                }
                onMouseEnter={event => setSidebar(true)}
                onMouseLeave={event => setSidebar(false)}
                ref={wrapperRef}
            >

                <div className="sidebar__container">

                    <h2 className="sidebarHeading">Contacts</h2>

                    {sidebarItems.map((item, index) => {
                        return <SidebarOnlineItem
                            key={item._id}
                            item={item}
                            showSidebar={props.showMenu}
                        />
                    })}

                </div>


            </div>

        </>


    )


}


export default SidebarOnline;
