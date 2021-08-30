import React, {useRef} from "react";
import {Link} from "react-router-dom"

import useOutsideAlerter from "../../helper/useOutsideAlerter";


function Option(props) {

    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, () => {
            props.hideOptions(true)
        },
        `[id='${props.postId}'] .feedPostOption__iconContainer`
    );


    return (
        <ul className={"feedPostOption__list"} ref={wrapperRef}>
            <li>
                <Link to={"/post/" + props.postId}>View Post</Link>
            </li>
            {
                props.postUserId.toString() === localStorage.getItem('userID') ?
                    <li>
                        <button onClick={props.delete}>Delete Post</button>
                    </li> : null
            }
        </ul>

    );

}


export default Option;
