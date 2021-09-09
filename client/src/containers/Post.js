import React from "react";

import axios from "../helper/axios";
import handleAxiosError from "../helper/handleAxiosError";

import FillScreen from "../components/FillScreen";
import FeedPost from "../components/feed/FeedPost";
import Loading from "../components/ui/Loading";
import ShowResponse from "../components/ui/ShowResponse";


class Feed extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            post: null,
            isLoading: false,
            responseMsg: "",
            responseStatus: "",
            commentLikeUpdate:null,
            commentAdded: null,
            myUser: {
                firstName: ".",
                lastName: "."
            },
        }

    }



    componentDidMount() {
        this.getPost()
        this.getUser(localStorage.getItem('userID'),'myUser');
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (this.props.onlineUser && prevProps.onlineUser !== this.props.onlineUser) {

            let post = {...this.state.post}

            if (post.user._id === this.props.onlineUser._id) {
                post.user.isOnline = true
            }


            post.comments.by.forEach((comment, index) => {
                if (comment.person._id === this.props.onlineUser._id)
                    comment.person.isOnline = true
            })

            this.setState({post})

        }


        if (this.props.offlineUser && prevProps.offlineUser !== this.props.offlineUser) {


            let post = {...this.state.post}
            if (post.user._id === this.props.offlineUser._id) {
                post.user.isOnline = false
            }


            post.comments.by.forEach(comment => {
                if (comment.person._id === this.props.offlineUser._id)
                    comment.person.isOnline = false
            })
            this.setState({post: post})

        }


        if (this.props.notification && prevProps.notification !== this.props.notification) {
            this.updatePostRealtime(this.props.notification);
        }


    }


    getPost = () => {

        axios.get(
            "/getSinglePosts",
            {
                params: {
                    postID: this.props.match.params.id,
                }
            })
            .then(result => {

                this.setState({
                    post: result.data.post
                })

            })
            .catch(error => {
                handleAxiosError(error, this.setResponsePreview, "Loading Failed...")
            })


    }

    getUser = (id,userType) => {

        axios.get(
            "/getUser",
            {
                params: {
                    profileID: id,
                }
            })
            .then(result => {

                this.setState({
                    [userType]: result.data.user
                })

            })
            .catch(error => {

                handleAxiosError(error, this.setResponsePreview, "Loading Failed...")

            })


    }


    updatePostRealtime = (data) => {

        if (data.eventType === "postLiked")
            this.postLikeEvent(data, true);
        if (data.eventType === "postUnliked")
            this.postLikeEvent(data, false);
        else if (data.eventType === "commentLiked")
            this.setState({commentLikeUpdate: {...data, isLiked: true}})
        else if (data.eventType === "commentUnliked")
            this.setState({commentLikeUpdate: {...data, isLiked: false}})
        else if (data.eventType === "postComment")
            this.setState({commentAdded: data.comment})


    }


    postLikeEvent = (data, isLiked) => {

        let post = {...this.state.post};

        if (post._id !== data.postID) return;

        let likes = {...post.likes}


        if (isLiked) {
            post.realtimeLike = data.personData
            likes.count += 1
        } else {
            post.realtimeUnlike = data.personData
            likes.count -= 1
        }

        post.likes = {...likes}

        this.setState({post})
    }


    setResponsePreview = (status, msg) => {
        this.setState({
            responseMsg: msg,
            responseStatus: status
        })
    }



    render() {


        return (
            <FillScreen class="bg-light">

                {this.state.responseStatus !== "" ?
                    <ShowResponse
                        status={this.state.responseStatus}
                        message={this.state.responseMsg}
                        hideMe={() => this.setState({responseStatus: ""})}
                    />
                    : null
                }


                <div className="home__container d-flex flex-row feedCont">

                    <div className="feed">

                        {
                            this.state.post ?
                                <FeedPost
                                    key={this.state.post._id}
                                    post={this.state.post}
                                    removePost={this.removePost}
                                    myUser={this.state.myUser}
                                    setResponsePreview={this.setResponsePreview}
                                    commentLikeUpdate={
                                        this.state.commentLikeUpdate?.postID === this.state.post._id ? this.state.commentLikeUpdate : null
                                    }
                                    commentUpdate={
                                        this.state.commentAdded?.postID === this.state.post._id ? this.state.commentAdded : null
                                    }
                                /> : null
                        }

                        {
                            this.state.isLoading ? <Loading/> : null
                        }

                    </div>

                </div>

            </FillScreen>
        );

    }

}


export default Feed;
