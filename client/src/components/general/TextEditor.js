import React, {useState} from "react";
import Avatar from "../profile/Avatar";
import {ReactComponent as Send} from "../../assets/img/svg/send.svg";
import {Link} from "react-router-dom";
import configs from "../../assets/config/configs";


function TextEditor(props) {

    // PROPS
    // profile -> {firstName,LastName,profilePicture,_id}

    const [commentValue, changeCommentValue] = useState("");

    let onKeyPress = () => {
    };
    if (props.onKeyPress) onKeyPress = props.onKeyPress;


    let profilePic = props?.profile?.profilePicture || "";


    return (
        <div className="textEditor d-flex">


            <Link to={"/profile/" + props.profile?._id || ""}>
                <Avatar isActive={props.profile?.isOnline || props.profile._id === localStorage.getItem("userID")}
                        url={profilePic}/>
            </Link>
            <div className="textEditor__input d-flex">

                <textarea
                    placeholder={props.placeholder}
                    value={commentValue}
                    onChange={e => {
                        e.preventDefault();
                        // e.target.blur();
                        changeCommentValue(e.target.value)
                    }}
                    onKeyPress={onKeyPress}
                    // onKeyUp={onKeyUp}
                />


                <button
                    onClick={() => props.post(commentValue, () => {
                        changeCommentValue('')
                    })}
                    disabled={commentValue.length < 1}
                >
                    <Send/>
                </button>

            </div>


        </div>

    )


}


export default TextEditor;
