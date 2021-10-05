import React from "react";
import {Link} from "react-router-dom";
import Avatar from "../profile/Avatar";
import timeDifference from "../../helper/timeDiff";

import axios from "../../helper/axios";
import configs from "../../assets/config/configs";
import handleAxiosError from "../../helper/handleAxiosError";


function Comment(props) {


    const like = () => {
        axios.post(
            "/likeComment",
            JSON.stringify({
                commentID: props.ele._id,
            }))
            .then(result => {
                props.updateComment(props.ele._id, result.data.commentLikes)
            })
            .catch(error => {
                handleAxiosError(error,this.props.setResponsePreview,"Failed to like comment...")
            })

    }

    let profilePic = props.ele?.person?.profilePicture || "";

    return (
        <div className={"postComment" + (props.indent ? (" indent-" + props.indent) : "")}>

            <div className="postComment__content">


                <Link to={"/profile/" + props.ele.person._id || ""}>
                    <Avatar url={profilePic} isActive={props.ele.person.isOnline || props.ele.person._id ===localStorage.getItem("userID")}/>
                </Link>

                {/*<div className="line"></div>*/}
                <div className="postComment__content__text">

                    <Link to={"/profile/" + props.ele.person._id}>
                        {props.ele.person.firstName + ' ' + props.ele.person.lastName}
                    </Link>
                    <pre>
                        {props.ele.content}
                    </pre>

                    {
                        props.ele.likes.count > 0 ?
                            <div className="postComment__content__text__likes">
                                <i className="like"/>
                                <span>{props.ele.likes.count}</span>
                            </div>
                            : null
                    }

                </div>


            </div>


            <div className="postComment__reacts">


                <div className="postComment__reacts__item">
                    <button onClick={like}>
                        Like
                    </button>
                </div>

                {/*add reply feature later */}
                {/*<div className="postComment__reacts__item">*/}
                {/*    <button>*/}
                {/*        Reply*/}
                {/*    </button>*/}
                {/*</div>*/}

                <div className="postComment__reacts__item">
                    <p>
                        {timeDifference(new Date(props.ele.date).getTime())}
                    </p>
                </div>
                {
                    props.ele.hasReply ?
                        <div className="postComment__reacts__item">
                            <button>
                                <p>
                                    Load replies
                                </p>
                            </button>
                        </div>
                        : null
                }


            </div>


        </div>
    );

}


export default Comment;
