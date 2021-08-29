import React from "react";
import Header from "../header/Header";

function Layout(props) {


    return (
        <>
            <Header history={props.history}/>
            {props.children}
        </>
    );

}


export default Layout;
