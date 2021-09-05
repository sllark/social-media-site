import React, {useEffect, useState} from "react";
import Header from "../header/Header";
import Sidebar from "../general/Sidebar";
import SidebarOnline from "../general/SidebarOnline";

function Layout(props) {
    const [menuLeftOpen, setMenuLeftOpen] = useState(false);
    const [menuRightOpen, setMenuRightOpen] = useState(false);

    const [onlineUser, setOnlineUser] = useState(null);
    const [offlineUser, setOfflineUser] = useState(null);

    const [socket, setSocket] = useState(null);
    const [notifi, setNotifi] = useState(null);

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



    const addSocketEvents = ()=>{

        props.socket.on('postLiked',newNotification)
        props.socket.on('postUnliked',newNotification)
        props.socket.on('postShared',newNotification)
        props.socket.on('req',newNotification)

    }

    const newNotification = (data)=>{
        setNotifi(data);
    }



    return (
        <>
            <Header history={props.history}
                    menuLeftOpen={menuLeftOpen}
                    setMenuLeftOpen={setMenuLeftOpen}
                    menuRightOpen={menuRightOpen}
                    setMenuRightOpen={setMenuRightOpen}
                    notification={notifi}
            />
            <Sidebar history={props.history}
                     isVisible={menuLeftOpen}
                     showMenu={setMenuLeftOpen}
            />

            {
                React.cloneElement(props.children, {
                    onlineUser: onlineUser,
                    offlineUser: offlineUser,
                    notification:notifi
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
