import React from "react";
import {Link} from "react-router-dom";

import configs from "../../assets/config/configs";
import Avatar from "../profile/Avatar";
import timeDifference from "../../helper/timeDiff";



function Comment(props) {


    const like = () => {

        let link = configs.api_url+"/likeComment";

        fetch(link, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify({
                commentID: props.ele._id,
            })
        })
            .then(resp => resp.json())
            .then(result => {

                if (result.error)
                    throw new Error(JSON.stringify(result));

                props.updateComment(props.ele._id,result.commentLikes)
                console.log(result);

            })
            .catch(error => {
                // let errorObject = JSON.parse(error.message);
                console.log(error);

            })

    }

    return (
        <div className={"postComment" + (props.indent ? (" indent-" + props.indent) : "")}>

            <div className="postComment__content">

                <Avatar/>

                {/*<div className="line"></div>*/}
                <div className="postComment__content__text">

                    <Link to={"/profile/" + props.ele.person._id}>
                        {props.ele.person.firstName + ' ' + props.ele.person.lastName}
                    </Link>
                    <pre>
                        {props.ele.content}
                    </pre>

                    {
                        props.ele.likes.count>0 ?
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
