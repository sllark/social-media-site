import React, {useRef, useState} from "react";
import {Link} from "react-router-dom"

import useOutsideAlerter from "../../helper/useOutsideAlerter";


function Option(props) {

    const [hideOptions, changeHideOptions] = useState(true);
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, () => {
        changeHideOptions(true)
    });


    return (
        <div className="feedPostOption" ref={wrapperRef}>

            <div
                className="feedPostOption__iconContainer"
                onClick={
                    (e) => changeHideOptions(!hideOptions)
                }
            >
                <i className="feedPostOption__icon"/>
            </div>

            <ul className={"feedPostOption__list" + (hideOptions ? " hideModal" : "")}>
                <li>
                    <Link to={"/post/"+props.posId}>View Post</Link>
                </li>
                {
                    props.postUserId.toString() === localStorage.getItem('userID') ?
                        <li>
                            <button onClick={props.delete}>Delete Post</button>
                        </li> : null
                }
            </ul>

        </div>
    );

}


export default Option;
