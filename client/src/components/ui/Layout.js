import React, {useEffect, useState} from "react";
import Header from "../header/Header";
import Sidebar from "../general/Sidebar";
import SidebarChats from "../general/SidebarChats";
import SidebarOnline from "../general/SidebarOnline";
import axios from "../../helper/axios";
import handleAxiosError from "../../helper/handleAxiosError";

function Layout(props) {
    const [menuLeftOpen, setMenuLeftOpen] = useState(false);
    const [menuRightOpen, setMenuRightOpen] = useState(false);

    const [onlineUser, setOnlineUser] = useState(null);
    const [offlineUser, setOfflineUser] = useState(null);

    const [socket, setSocket] = useState(null);
    const [notifi, setNotifi] = useState(null);
    const [friendRequestStatus, setFriendRequestStatus] = useState(null); // friend request status

    const [newMsg, setNewMsg] = useState(null);
    const [unreadMsgs, setUnreadMsgs] = useState(0);


    useEffect(() => {
        getUnReadMsgs()
    }, [])

    useEffect(() => {
        setOnlineUser(props.usersOnline[0]);
    }, [props.usersOnline])

    useEffect(() => {
        setOfflineUser(props.usersOffline[0]);
    }, [props.usersOffline])

    useEffect(() => {
        if (!socket && props.socket) {
            setSocket(props.socket)
            addSocketEvents();
        }
    }, [props.socket])

    const getUnReadMsgs = () => {

        axios
            .get("/getUnreadMessages")
            .then(result => {

                setUnreadMsgs(result.data.unread)

            })
            .catch(error => {
                // handleAxiosError(error, setResponsePreview, "Notifications Loading Failed...")
            })


    }

    const addSocketEvents = () => {

        props.socket.on('postLiked', (data) => newNotification(data, 'postLiked'))
        props.socket.on('postUnliked', (data) => newNotification(data, 'postUnliked'))
        props.socket.on('postComment', (data) => newNotification(data, 'postComment'))
        props.socket.on('commentLiked', (data) => newNotification(data, 'commentLiked'))
        props.socket.on('commentUnliked', (data) => newNotification(data, 'commentUnliked'))
        props.socket.on('postShared', (data) => newNotification(data, 'postShared'))
        props.socket.on('req', (data) => newNotification(data, 'req'))
        props.socket.on('reqCancel', (data) => newNotification(data, 'reqCancel'))
        props.socket.on('reqAccepted', (data) => newNotification(data, 'reqAccepted'))
        props.socket.on('reqDeclined', (data) => newNotification(data, 'reqDeclined'))
        props.socket.on('unfriend', (data) => newNotification(data, 'unfriend'))

        // props.socket.on('new chat message', (data) => {
        //     console.log("mdg",data);
        // })

    }

    const newNotification = (data, eventType) => {

        data = {
            ...data,
            eventType
        }
        setNotifi(data);
    }

    const newMessage = (msg)=>{
        setNewMsg(msg);
    }

    return (
        <>
            <Header history={props.history}
                    menuLeftOpen={menuLeftOpen}
                    setMenuLeftOpen={setMenuLeftOpen}
                    menuRightOpen={menuRightOpen}
                    setMenuRightOpen={setMenuRightOpen}
                    notification={notifi}
                    setRequestStatus={setFriendRequestStatus}
                    unreadMsgs={unreadMsgs}
            />


            {
                props.isMessanger ?
                    <SidebarChats routerMatch={props.match}
                                  isVisible={menuLeftOpen}
                                  showMenu={setMenuLeftOpen}
                                  newMessage={newMsg}
                    /> :
                    <Sidebar history={props.history}
                             isVisible={menuLeftOpen}
                             showMenu={setMenuLeftOpen}
                    />
            }


            {
                React.cloneElement(props.children, {
                    onlineUser: onlineUser,
                    offlineUser: offlineUser,
                    notification: notifi,
                    requestStatus: friendRequestStatus,
                    addNewMessage: props.isMessanger ? newMessage : null,
                })
            }


            <SidebarOnline
                isVisible={menuRightOpen}
                showMenu={setMenuRightOpen}
                hideSidebarLG={props.hideOnlineSidebar}
                onlineUser={onlineUser}
                offlineUser={offlineUser}
                removeUser={props.removeUser}
            />

        </>
    );

}



export default Layout;
