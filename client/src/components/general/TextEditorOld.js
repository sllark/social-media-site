import React, {useRef, useState} from "react";
import Avatar from "../profile/Avatar";
import {ReactComponent as Send} from "../../assets/img/svg/send.svg";


//use htmlToText to convert text to html
function TextEditor(props) {

    const commentRef = useRef();

    const [commentValue, changeCommentValue] = useState("");
    const [placeholder, changePlaceholder] = useState(true);


    const displayPlaceholder = (show) => {

        if (!show) {
            commentRef.current.focus();
        }
        changePlaceholder(show);
    }

    const clearValues = () => {
        commentRef.current.innerHTML = "";
        changeCommentValue("");
        changePlaceholder(true);
    }


    return (
        <div className="textEditor d-flex">

            <Avatar isActive={true}/>
            <div className="textEditor__input d-flex">

                <div className="textEditor__input__box"
                     ref={commentRef}
                     contentEditable={true}
                     suppressContentEditableWarning="true"
                     onClick={() => displayPlaceholder(false)}
                     onFocus={() => displayPlaceholder(false)}
                     onKeyDown={(e) => {
                         changeCommentValue(e.target.innerHTML);
                     }}
                     onBlur={
                         (e) => {
                             if (commentValue.length < 1)
                                 displayPlaceholder(true)
                         }
                     }
                >

                    {placeholder ?
                        <span
                            className="textEditor__input__box__placeholder">Write a comment...</span>
                        : null
                    }

                </div>

                <button
                    onClick={() => props.post(commentValue, clearValues)}
                    disabled={commentValue.length < 1}
                >
                    <Send/>
                </button>

            </div>


        </div>

    )


}


export default TextEditor;
