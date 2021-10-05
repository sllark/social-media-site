import React, {createRef} from "react";


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
import handleAxiosError from "../../helper/handleAxiosError";

class FeedPost extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            likes: [],
            likesNum: this.props.post.likes.count || 0,
            hasLiked: this.props.post.likes.likedByMe || false,
            commentsNum: this.props.post.comments.count,
            comments: this.props.post.comments.by,
            shares: this.props.post.shares?.by || [],
            sharesNum: this.props.post.shares?.count || 0,
            showComments: true,
            commentDisplayNum: 2,
            showLikesModal: false,
            showImageModal: false,
            loadingLikes: false,
            hideOptions: true
        }

        this.modalRef = createRef();
    }


    componentDidMount() {
        this.loadLikes()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevState.showLikesModal !== this.state.showLikesModal) {

            if (this.state.showLikesModal) {
                this.modalRef.current.addEventListener('scroll', this.scrollModal)
                //event removed automatically when element is removed
            } else {
                this.setState({loadingLikes: false})
            }

        }

        if (prevProps.post.likes?.count < this.props.post?.likes?.count)
            this.realtimePostLike()
        else if (prevProps.post.likes?.count > this.props.post?.likes?.count)
            this.realtimePostUnlike()
        else if (prevProps.post.shares?.count < this.props.post.shares?.count)
            this.realtimePostShare()
        else if (prevProps.commentLikeUpdate !== this.props.commentLikeUpdate)
            this.realtimeCommentUpdate()
        else if (prevProps.commentUpdate?._id !== this.props.commentUpdate?._id)
            this.realtimeCommentAdded()

    }

    scrollModal = () => {

        let obj = this.modalRef.current;
        if (obj
            && obj.scrollTop >= (obj.scrollHeight - obj.offsetHeight)
            && this.state.likesNum !== this.state.likes.length
            && !this.state.loadingLikes) {
            this.loadLikes()
        }

    }

    loadLikes = () => {
        this.setState({loadingLikes: true})

        axios.get(
            "/getPostLikes",
            {
                params: {
                    postID: this.props.post._id,
                    likesLoaded: this.state.likes.length
                }
            }
        )
            .then(result => {

                this.setState(
                    (prevState) => {
                        return {
                            likes: [...prevState.likes, ...result.data.likes],
                        }
                    }
                )

            })
            .catch(error => {
                handleAxiosError(error, this.props.setResponsePreview, "Internal Server Error.")
            })
            .then(() => {
                this.setState({loadingLikes: false})
            })


    }

    likeClick = (e) => {

        // TODO: Add like in modal box too
        axios.post(
            "/likePost",
            JSON.stringify({
                postID: this.props.post._id,
            }))
            .then(result => {

                console.log(result)

                this.setState(
                    (prevState) => {
                        return {
                            likesNum: prevState.hasLiked ? prevState.likesNum - 1 : prevState.likesNum + 1,
                            hasLiked: !prevState.hasLiked
                        }
                    }
                )

            })
            .catch(error => {
                handleAxiosError(error, this.props.setResponsePreview, "Internal Server Error.")
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

    sharePost = (e) => {

        axios.post(
            "/sharePost",
            JSON.stringify({
                postID: this.props.post._id,
            }))
            .then(result => {
                if (result.data.message === "success")
                    this.props.setResponsePreview("success", "Shared successfully on your profile.")

            })
            .catch(error => {
                handleAxiosError(error, this.props.setResponsePreview, "Internal Server Error.")
            })


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


                if (result.data.message === "success") {
                    let comments = [...this.state.comments];
                    comments.splice(0, 0, result.data.comment)
                    this.setState({
                        comments
                    })
                    clearValues()
                    // this.props.setResponsePreview("success", "Commented Successfully...")
                }


            })
            .catch(error => {

                handleAxiosError(error, this.props.setResponsePreview, "Internal Server Error.")

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
                    this.props.setResponsePreview("success", "Post deleted successfully...")
                }


            })
            .catch(error => {
                handleAxiosError(error, this.props.setResponsePreview, "Internal Server Error.")

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

    realtimePostLike = () => {

        this.setState(prevState => {

            let likes = [...prevState.likes];

            likes.splice(0, 0, this.props.post.realtimeLike)

            return {
                likes: likes,
                likesNum: prevState.likesNum + 1
            }
        })


    }

    realtimePostUnlike = () => {
        this.setState(prevState => {

            let likes = [...prevState.likes]
            likes = prevState.likes.filter(item => item._id !== this.props.post.realtimeUnlike);

            return {
                likes: likes,
                likesNum: prevState.likesNum - 1
            }
        })
    }


    realtimePostShare = () => {

        this.setState(prevState => {

            let shares = [...prevState.shares]
            shares.splice(0, 0, this.props.post.realtimeShare)

            return {
                shares: shares,
                shareNum: prevState.shareNum + 1
            }
        })
    }

    realtimeCommentUpdate = () => {
        let data = this.props.commentLikeUpdate;

        if (this.props.post._id !== data.postID) return;


        let comments = [...this.state.comments];

        let commentIndex = comments.findIndex(item => item._id === data.commentID);

        if (commentIndex < 0) return

        let commentToUpdate = {...comments[commentIndex]}
        let commentLikes = {...commentToUpdate.likes}
        let commentLikesBy = [...commentLikes.by]


        if (data.isLiked) {
            commentLikes.count += 1
            commentLikesBy.splice(0, 0, data.commentUpdateBy);
        } else {
            commentLikes.count -= 1
            commentLikesBy = commentLikesBy.filter(item => item !== data.commentUpdateBy);
        }

        commentToUpdate.likes = {...commentLikes, by: [...commentLikesBy]}
        comments[commentIndex] = commentToUpdate;

        this.setState({
            comments
        })

    }


    realtimeCommentAdded = () => {
        let data = this.props.commentUpdate;
        if (this.props.post._id !== data.postID) return;

        let comments = [...this.state.comments];
        comments.splice(0,0,data)
        this.setState({
            comments
        })
    }


    render() {


        let post = this.props.post;

        // let imgUrl = post.postImage;
        // if(imgUrl.indexOf('http')<0)
        //     imgUrl = configs.api_url + "/images/" + post.postImage;

        return (
            <>
                <div className="feedPost" id={post._id}>

                    <div className="feedPost__header">

                        <div className="feedPost__header__content">
                            <Avatar
                                url={post.user.profilePicture}
                                roundAvatar={true}
                                isActive={post.user.isOnline || post.user._id === localStorage.getItem("userID")}
                            />

                            <div className="feedPost__header__content__meta">
                                <Link to={'/profile/' + post.user._id}>
                                    {`${post.user.firstName} ${post.user.lastName}`}
                                </Link>
                                <span>{timeDifference(new Date(post.createdAt).getTime())}</span>
                            </div>
                        </div>


                        <div className="feedPost__header__options">
                            <div className="feedPostOption">

                                <div
                                    className="feedPostOption__iconContainer"
                                    onClick={
                                        (e) => this.setState(prevState => {
                                            return {
                                                hideOptions: !prevState.hideOptions
                                            }
                                        })
                                    }
                                >
                                    {
                                        !this.state.hideOptions &&
                                        <Option postUserId={post.user._id} postId={post._id} delete={this.deletePost}
                                                hideOptions={() => this.setState({hideOptions: true})}/>
                                    }

                                    <i className="feedPostOption__icon"/>
                                </div>


                            </div>
                        </div>

                    </div>

                    <div className={"feedPost__content" + (!post.postImage && post.isShared ? " borderBottom" : "")}>

                        <pre className="feedPost__content__description">
                            {post.postText}
                        </pre>

                        {
                            post.postImage ?
                                <img
                                    src={post.postImage}
                                    alt=""
                                    onClick={this.showImage}
                                />
                                : null
                        }
                    </div>


                    {
                        post.isShared ?
                            <div className="feedPost__shared">

                                <Link
                                    to={"/profile/" + post.sharedFrom._id}>
                                    {post.sharedFrom.firstName + " " + post.sharedFrom.lastName}
                                </Link>
                                <span>{timeDifference(new Date(post.originalPostedTime).getTime())}</span>

                            </div>
                            : null
                    }


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
                                <div className="feedPost__reacts__item" onClick={this.sharePost}>
                                    <i className="share"/>
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

                        <TextEditor post={this.postComment} profile={this.props.myUser} placeholder="Write a comment..."/>


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
                            changeShowModal={value => this.setState({showLikesModal: value})}
                            modalRef={this.modalRef}>

                            <h2>People who liked the post</h2>

                            <div className="modalBody flex-start">

                                {
                                    this.state.likes.map(user => <NameDisplay key={user._id} user={user}/>)
                                }

                            </div>

                        </Modal>

                        : null
                }

            </>
        )

    }


}


export default FeedPost;
