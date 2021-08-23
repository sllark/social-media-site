import React from "react";

import useOutsideAlerter from "../../helper/useOutsideAlerter";


function ProfileHeaderOptions(props) {

    useOutsideAlerter(props.imageRef, () => {
        props.changeHideOptions(true)
    });


    return (
        <div className={"feedPostOption headerOptions" + (props.coverOptions ? " coverOptions" : "")}>

            <ul className={"feedPostOption__list" + (props.hideOptions ? " hideModal" : "")}>
                {
                    props.children
                }
            </ul>

        </div>
    );

}


export default ProfileHeaderOptions;
