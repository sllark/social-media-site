import React, {useState} from "react";
import Header from "../header/Header";
import Sidebar from "../general/Sidebar";
import SidebarOnline from "../general/SidebarOnline";

function Layout(props) {
    const [menuLeftOpen, setMenuLeftOpen] = useState(false);
    const [menuRightOpen, setMenuRightOpen] = useState(false);


    return (
        <>
            <Header history={props.history}
                    menuLeftOpen={menuLeftOpen}
                    setMenuLeftOpen={setMenuLeftOpen}
                    menuRightOpen={menuRightOpen}
                    setMenuRightOpen={setMenuRightOpen}
            />
            <Sidebar history={props.history}
                     isVisible={menuLeftOpen}
                     showMenu={setMenuLeftOpen}
            />
            {props.children}

            <SidebarOnline
                isVisible={menuRightOpen}
                showMenu={setMenuRightOpen}
                hideSidebarLG={props.hideOnlineSidebar}
            />

        </>
    );

}


export default Layout;
