import React, {useEffect, useRef, useState} from "react";
import useOutsideAlerter from "../../helper/useOutsideAlerter";
import axios from "../../helper/axios";
import Loading from "../ui/Loading";
import SidebarChatItem from "./SidebarChatItem";


function Sidebar(props) {

    const wrapperRef = useRef(null);
    const [chats, setChats] = useState([]);
    const [chatsLoading, setChatsLoading] = useState(true);

    useOutsideAlerter(wrapperRef, () => {
        props.showMenu(false)
    }, '.hamburgerMenuLeft');


    useEffect(() => {
        getChats(chats.length);
    }, [])


    let getChats = (loaded = 0) => {
        setChatsLoading(true)

        axios
            .get("/getChats", {
                params: {
                    loaded: loaded
                }
            })
            .then(result => setChats(result.data.chats))
            .catch(error => setChats(null))
            .then(() => setChatsLoading(false))

    }


    return (
        <div className={"sidebar sidebarOptions" + (props.isVisible ? " showSidebar" : "")} ref={wrapperRef}>

            <div className="sidebar__container">

                {
                    !chats ?
                        <p>Could not Load Previous Chats.</p> :
                        chats && chats.length === 0 && !chatsLoading ?
                            <p>No Chats to Load.</p> :
                            chats.map(item =>
                                <SidebarChatItem
                                    key={item._id}
                                    item={item}
                                    showSidebar={props.showMenu}/>
                            )


                }

                {
                    chatsLoading ?
                        <Loading/> : null
                }


            </div>


        </div>

    )


}


export default Sidebar;
