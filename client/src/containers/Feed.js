import React from "react";

import axios from "../helper/axios";
import handleAxiosError from "../helper/handleAxiosError";

import FillScreen from "../components/FillScreen";
import CreateNewPost from "../components/feed/CreateNewPost";
import FeedPost from "../components/feed/FeedPost";
import Loading from "../components/ui/Loading";
import ShowResponse from "../components/ui/ShowResponse";


class Feed extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            posts: [],
            maxPost: 1,
            isLoading: false,
            responseMsg: "",
            responseStatus: "",
            user: {
                firstName: ".",
                lastName: "."
            }
        }

        this.scrollEvent = null;

    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (this.props.onlineUser && prevProps.onlineUser !== this.props.onlineUser) {

            let posts = [...this.state.posts]
            posts = posts.map(item => {

                if (item.user._id === this.props.onlineUser._id) {
                    item.user.isOnline = true
                }


                item.comments.by.forEach((comment, index) => {
                    if (comment.person._id === this.props.onlineUser._id)
                        comment.person.isOnline = true
                })

                return item;

            })
            this.setState({posts: posts})

        }


        if (this.props.offlineUser && prevProps.offlineUser !== this.props.offlineUser) {


            let posts = [...this.state.posts]
            posts = posts.map(item => {

                if (item.user._id === this.props.offlineUser._id) {
                    item.user.isOnline = false
                }


                item.comments.by.forEach(comment => {
                    if (comment.person._id === this.props.offlineUser._id)
                        comment.person.isOnline = false
                })

                return item;

            })
            this.setState({posts: posts})

        }


        if (this.props.notification && prevProps.notification !== this.props.notification) {
            this.updatePostRealtime(this.props.notification);
        }


    }

    componentDidMount() {
        this.scrollEvent = window.addEventListener('scroll', this.loadMore);
        this.getFeedPostsCount()
        this.loadFeedPosts()
        this.getMyUser()
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.loadMore);
    }

    updatePostRealtime = (notification) => {


        if (notification.notificationType === "like") {
            this.postLikeEvent(notification);
        }


        // notificationType
        // notificationPostID


    }

    postLikeEvent = (data) => {

        let posts = [...this.state.posts];
        let postIndex = posts.findIndex(item => item._id === data.notificationPostID);

        if (postIndex < 0) return;

        let postToUpdate = {...posts[postIndex]}
        let likes = {...postToUpdate.likes}
        let likesBy = [...likes.by]

        if (data.person._id) { // post liked

            postToUpdate.realtimeLike = data.person
            likes.count += 1
            likesBy.splice(0,0,data.person._id);

            this.setResponsePreview("message",data.content);

        }
        else { //like removed
            postToUpdate.realtimeUnlike = data.person
            likes.count -= 1
            likesBy = likesBy.filter(item => item !== data.person);
        }


        postToUpdate.likes = {...likes, by: [...likesBy]};
        posts[postIndex] = postToUpdate;

        this.setState({posts})
    }




    getMyUser = () => {
        let id = localStorage.getItem('userID');

        axios.get(
            "/getUser",
            {
                params: {
                    profileID: id,
                }
            })
            .then(result => {

                this.setState({
                    user: result.data.user
                })

            })
            .catch(error => {
                handleAxiosError(error, this.setResponsePreview, "Loading Failed...")
            })


    }

    loadMore = (e) => {

        if (
            window.innerHeight + document.documentElement.scrollTop === document.scrollingElement.scrollHeight
            && this.state.maxPost !== this.state.posts.length
            && !this.state.isLoading
        ) {
            this.loadFeedPosts();
        }
    }

    loadFeedPosts = () => {


        this.setState({
            isLoading: true
        })

        axios.get(
            "/getFeedPosts",
            {
                params: {
                    postsLoaded: this.state.posts.length
                }
            })
            .then(result => {

                if (result.data.message === "success") {
                    this.setState((prevState) => {
                        return {
                            posts: [...prevState.posts, ...result.data.posts],
                        }
                    })
                }

            })
            .catch(error => {
                handleAxiosError(error, this.setResponsePreview, "Loading Failed...")
            })
            .then(() => {
                this.setState({
                    isLoading: false
                })
            })

    }

    getFeedPostsCount = () => {

        axios.get("/getFeedPostsCount")
            .then(result => {
                if (result.data.message === "success") this.setState({maxPost: result.data.max})

            })
            .catch(error => {
                handleAxiosError(error, this.setResponsePreview, "Loading Failed...")
            })
    }

    addNewPost = (post) => {
        let posts = [...this.state.posts];

        posts.splice(0, 0, post)
        this.setState((prevState) => {
            return {
                posts: posts,
                maxPost: prevState.maxPost + 1
            }
        })

    }

    removePost = (postID) => {

        let posts = [...this.state.posts]

        let postIndex = posts.findIndex(ele => ele._id === postID);

        if (postIndex < 0) return;

        posts.splice(postIndex, 1);

        this.setState(prevState => {
            return {
                posts,
                maxPost: prevState.maxPost - 1,
            }
        })
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
                        <CreateNewPost
                            placeholder={"write something..."}
                            addNewPost={this.addNewPost}
                            setResponsePreview={this.setResponsePreview}
                            user={this.state.user}
                        />

                        {
                            this.state.posts.map(post =>
                                <FeedPost
                                    key={post._id}
                                    post={post}
                                    removePost={this.removePost}
                                    setResponsePreview={this.setResponsePreview}
                                />)
                        }
                        {
                            !this.state.isLoading && this.state.posts.length < 1 ?
                                <h2 className="infoHeading">Nothing to show...</h2> : null
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
