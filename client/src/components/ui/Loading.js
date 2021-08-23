import React from "react";


function Loading(props) {


    return (
        <div className={
            "loading" +
            (props.flexStart ? " flex-start" : "")
        }>

            <div className="lds-ripple">
                <div></div>
                <div></div>
            </div>

        </div>
    );

};


export default Loading;
