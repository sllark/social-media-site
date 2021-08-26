import React from "react";


import Avatar from "../profile/Avatar";
import Option from "../ui/Option";
import Comment from "./Comment";
import TextEditor from "../general/TextEditor";
import Modal from "../ui/Modal";
import NameDisplay from "../ui/NameDisplay";
import ImageModal from "../ui/ImageModal";


import timeDifference from "../../helper/timeDiff";
import {Link} from "react-router-dom";
import configs from "../../assets/config/configs";
import axios from "../../helper/axios";

class FeedPost extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            likesNum: this.props.post.likes.count || 0,
            hasLiked: this.props.post.likes.likedByMe || false,
            commentsNum: this.props.post.comments.count,
            comments: this.props.post.comments.by,
            showComments: true,
            commentDisplayNum: 2,
            showLikesModal: false,
            showImageModal: false
        }

    }


    likeClick = (e) => {


        this.setState(
            (prevState) => {
                return {
                    likesNum: prevState.hasLiked ? prevState.likesNum - 1 : prevState.likesNum + 1,
                    hasLiked: !prevState.hasLiked
                }
            }
        )

        axios.post(
            "/likePost",
            JSON.stringify({
                postID: this.props.post._id,
            }))
            .then(result => {
                console.log(result.data);
            })
            .catch(error => {
                console.log(error);
            })


    }

    commentClick = (e) => {

        this.setState(
            (preState) => {
                return {
                    showComments: !preState.showComments
                }
            }
        )

    }


    loadComments = (e) => {

        this.setState(
            (preState) => {
                return {
                    commentDisplayNum: preState.commentDisplayNum + 3
                }
            }
        )

    }


    postComment = (value, clearValues) => {


        axios.post(
            "/commentPost",
            JSON.stringify({
                postID: this.props.post._id,
                value: value
            }))
            .then(result => {

                let comments = [...this.state.comments];
                comments.splice(0, 0, result.data.comment)
                this.setState({
                    comments
                })

                clearValues()
            })
            .catch(error => {
                console.log(error);
            })

    }


    deletePost = () => {

        let postID = this.props.post._id;

        axios.post(
            "/deletePost",
            JSON.stringify({
                postID: postID,
            }))
            .then(result => {


                if (result.data.message === "success") {
                    this.props.removePost(postID);
                }

            })
            .catch(error => {
                console.log(error);
            })


    }

    updateComment = (commentID, commentLikes) => {

        let comments = [...this.state.comments];

        let commentIndex = comments.findIndex(ele => ele._id === commentID)
        // comments[commentIndex].likes.count += 1;
        comments[commentIndex].likes = commentLikes;

        this.setState({
            comments: comments
        })

    }


    showImage = () => {
        this.setState({showImageModal: true})
    }

    render() {

        let post = this.props.post;

        return (
            <>
                <div className="feedPost">

                    <div className="feedPost__header">

                        <div className="feedPost__header__content">
                            <Avatar
                                url={
                                    post.user.profilePicture ?
                                        (configs.api_url + "/images/" + post.user.profilePicture) : null
                                }
                                roundAvatar={true}
                            />

                            <div className="feedPost__header__content__meta">
                                <Link to={'/profile/' + post.user._id}>
                                    {`${post.user.firstName} ${post.user.lastName}`}
                                </Link>
                                <span>{timeDifference(new Date(post.createdAt).getTime())}</span>
                            </div>
                        </div>


                        <div className="feedPost__header__options">
                            <Option postUserId={post.user._id} delete={this.deletePost}/>
                        </div>

                    </div>

                    <div className="feedPost__content">

                        <pre className="feedPost__content__description">
                            {post.postText}
                        </pre>

                        {
                            post.postImage ?
                                <img
                                    src={configs.api_url + "/images/" + post.postImage}
                                    alt=""
                                    onClick={this.showImage}
                                />
                                : null
                        }
                    </div>

                    {
                        this.state.likesNum > 0 || this.state.comments.length > 0 ?
                            <div className="feedPost__stats">

                                <button
                                    onClick={
                                        () => this.setState({showLikesModal: true})
                                    }
                                >
                                    {
                                        this.state.likesNum > 0 ?
                                            (this.state.likesNum) + (this.state.likesNum === 1 ? " Like" : " Likes")
                                            : ""
                                    }
                                </button>

                                <button onClick={this.commentClick}>
                                    {
                                        this.state.comments.length > 0 ?
                                            (this.state.comments.length) + (this.state.comments === 1 ? " Comment" : " Comments")
                                            : ""
                                    }
                                </button>

                            </div>
                            : null
                    }

                    <div className={"feedPost__reacts"}>

                        <div
                            className={
                                "feedPost__reacts__item" +
                                (this.state.hasLiked ? " marked" : "") +
                                (post.user._id === localStorage.getItem('userID') ? " childWith50" : "")
                            }
                            onClick={this.likeClick}
                        >
                            <i className="like"/>
                            <p>
                                Like
                            </p>
                        </div>

                        <div className={
                            "feedPost__reacts__item" +
                            (this.props.commentsNum < this.state.commentsNum ? " marked" : "") +
                            (post.user._id === localStorage.getItem('userID') ? " childWith50" : "")
                        }
                             onClick={this.commentClick}>
                            <i className="comment"/>
                            <p>
                                Comment
                            </p>
                        </div>

                        {
                            post.user._id !== localStorage.getItem('userID') ?
                                <div className="feedPost__reacts__item">
                                    <i className="share"/>
                                    <p className="reactNumber">{""}</p>
                                    <p>
                                        Share
                                    </p>
                                </div>
                                : null
                        }


                    </div>


                    <div className={
                        "feedPost__commentCont" +
                        (!this.state.showComments ? " hideComments" : "")
                    }>

                        <TextEditor post={this.postComment} profile={post.user} placeholder="Write a comment..."/>


                        {
                            this.state.comments.map((ele, index) => {
                                if (index < this.state.commentDisplayNum)
                                    return <Comment key={ele._id} ele={ele} updateComment={this.updateComment}/>
                                else
                                    return null;

                            })

                        }


                        {

                            this.state.commentDisplayNum < this.state.comments.length ?
                                <button
                                    className="feedPost__commentCont__load"
                                    onClick={this.loadComments}
                                >Load more comments...</button>
                                : null

                        }

                    </div>


                </div>


                {
                    this.state.showImageModal ?
                        <ImageModal
                            showModal={this.state.showImageModal}
                            changeShowModal={option => this.setState({showImageModal: option})}
                            postImage={configs.api_url + "/images/" + post.postImage}
                        />
                        : null
                }


                {
                    this.state.showLikesModal ?
                        <Modal
                            showModal={this.state.showLikesModal}
                            changeShowModal={value => this.setState({showLikesModal: value})}>

                            <h2>People who liked the post</h2>

                            <div className="modalBody">

                                <NameDisplay isActive={true} name="AbdulRehman"/>
                                <NameDisplay isActive={false} name="Kainat Yousaf"/>
                                <NameDisplay isActive={true} name="Rana Numan"/>
                                <NameDisplay isActive={true} name="Kashif Abassi"/>
                                <NameDisplay isActive={false} name="Imran Amjad"/>
                                <NameDisplay isActive={true} name="Ali Nawaz"/>

                            </div>

                        </Modal>

                        : null
                }

            </>
        )

    }


}


export default FeedPost;
