import React from "react";


function Home(props) {


    return (
        <div className={"fillScreen " + props.class}>
            {props.children}
        </div>
    );

}


export default Home;
