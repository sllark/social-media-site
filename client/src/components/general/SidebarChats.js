import React, {useEffect, useRef} from "react";
import useState from "react-usestateref"
import Loading from "../ui/Loading";
import SidebarChatItem from "./SidebarChatItem";

import useOutsideAlerter from "../../helper/useOutsideAlerter";
import axios from "../../helper/axios";
import getProfileDetails from "../../helper/getProfileDetails";


function Sidebar(props) {

    const sidebarRef = useRef(null);

    const [sidebar, setSidebar] = useState(false)
    const [chats, setChats, chatsRef] = useState([]);
    const [chatsLoading, setChatsLoading] = useState(true);
    const [totalChats, setTotalChats] = useState(0);

    useOutsideAlerter(sidebarRef, () => {
        props.showMenu(false)
    }, '.hamburgerMenuLeft');


    useEffect(() => {
        getChats(chats.length);
        getTotalChats();
        sidebarRef.current.addEventListener('scroll', scrollPopup)

        return () => {
            // event will also get removed when element would be removed on page change
            sidebarRef.current?.removeEventListener('scroll', scrollPopup)
        }

    }, [])

    useEffect(() => {
        setRead();
    }, [props.routerMatch])

    useEffect(() => {

        let msg = props.newMessage;
        if (msg) {

            let allChats = [...chats];

            let changedIndex = -1;
            allChats.forEach((item, index) => {
                if (item._id === msg.to || item._id === msg.from) {
                    changedIndex = index;
                    allChats[index].lastMessage = msg.value;

                    if (props.routerMatch.params.id !== msg.to &&
                        props.routerMatch.params.id !== msg.from) allChats[index].unRead += 1

                    if (changedIndex >= 0) { // insert at top
                        let ele = allChats[changedIndex];
                        allChats.splice(changedIndex, 1);
                        allChats.splice(0, 0, ele)
                    }

                }
            })

            if (changedIndex >= 0) setChats(allChats)
            else addNewSidebarItem(msg);

        }

    }, [props.newMessage])


    const getChats = (loaded = 0) => {
        setChatsLoading(true)

        axios
            .get("/getChats", {
                params: {
                    loaded: loaded
                }
            })
            .then(result => setRead(result.data.chats))
            .catch(error => setChats([]))
            .then(() => setChatsLoading(false))

    }

    const getTotalChats = (loaded = 0) => {

        axios
            .get("/getTotalChats")
            .then(result => setTotalChats(result.data.total))
            .catch(error => setTotalChats(0))

    }

    const setRead = (fetchedChats) => {

        let id = props.routerMatch.params.id;
        if (!id) return;

        console.log(fetchedChats);

        let allChats = [...chats];
        if (fetchedChats) allChats = [...chats, ...fetchedChats];

        let changedIndex = allChats.findIndex(item => item._id === id);
        if (changedIndex >= 0) {
            // let unReads = allChats[changedIndex].unRead;
            allChats[changedIndex].unRead = 0
            updateUnreadChat();
        }

        setChats(allChats);

    }

    const updateUnreadChat = () => {

        axios.post("/updateUnreadChat",
            JSON.stringify({
                userID: props.routerMatch.params.id,
            })
        )
        // .then(result => {})
        // .catch(error => console.log(error))

    }

    const scrollPopup = () => {

        let obj = sidebarRef.current;
        if (obj
            && obj.scrollTop >= (obj.scrollHeight - obj.offsetHeight)
            && totalChats > chatsRef.current.length
            && !chatsLoading) {
            getChats(chatsRef.current.length)
        }

    }

    const addNewSidebarItem = async (msg) => {

        let userID = msg.from;
        if (localStorage.getItem('userID') === userID) userID = msg.to;

        let otherUser = await getProfileDetails(userID);

        otherUser.lastMessage = msg.value;
        otherUser.unRead = 0;

        if (props.routerMatch.params.id !== msg.to &&
            props.routerMatch.params.id !== msg.from) otherUser.unRead += 1


        setChats([otherUser, ...chats])

    }


    return (
        <div
            className={
                "sidebar sidebarOptions sidebarChats" +
                (sidebar ? " scrollbarVisible" : "") +
                (props.isVisible ? " showSidebar" : "")
            }
            onMouseEnter={event => setSidebar(true)}
            onMouseLeave={event => setSidebar(false)}
            ref={sidebarRef}
        >

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
                                    showSidebar={props.showMenu}
                                    currentChat={props.routerMatch.params.id}
                                />
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
