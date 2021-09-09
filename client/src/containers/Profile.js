import React from "react";
import {Link, Redirect} from "react-router-dom";

import axios from "../helper/axios";

import FillScreen from "../components/FillScreen";
import CreateNewPost from "../components/feed/CreateNewPost";
import ProfileHeader from "../components/profile/ProfileHeader";
import FeedPost from "../components/feed/FeedPost";
import Loading from "../components/ui/Loading";
import ShowResponse from "../components/ui/ShowResponse";
import handleAxiosError from "../helper/handleAxiosError";

class Profile extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            posts: [],
            maxPost: 1,
            isLoading: false,
            shouldRedirect: false,
            user: {
                firstName: ".",
                lastName: ".",
                isOnline:false
            },
            myUser: {
                firstName: ".",
                lastName: ".",
                isOnline:false
            },
            responseMsg: "",
            responseStatus: "",
            commentLikeUpdate: null,
            commentAdded: null,

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


        if (this.props.requestStatus && prevProps.requestStatus !== this.props.requestStatus) {
            if (this.props.requestStatus === "accepted") this.reqAccepted();
            else if (this.props.requestStatus === "declined") this.reqDeclined();

        }


    }


    componentDidMount() {

        if (this.props.match.params.id) {
            this.getUser(localStorage.getItem('userID'),'myUser');
            this.getUser(this.props.match.params.id,'user');
            this.scrollEvent = window.addEventListener('scroll', this.loadMore);
            this.loadPosts()
        } else {

            this.setState({
                shouldRedirect: true
            })

        }
    }


    componentWillUnmount() {
        window.removeEventListener('scroll', this.loadMore);
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
        else if (data.eventType === "req")
            this.reqRecived();
        else if (data.eventType === "reqCancel")
            this.reqDeclined();
        else if (data.eventType === "reqAccepted")
            this.reqAccepted();
        else if (data.eventType === "reqDeclined")
            this.reqDeclined();
        else if (data.eventType === "unfriend")
            this.reqDeclined();


    }

    postLikeEvent = (data, isLiked) => {

        let posts = [...this.state.posts];
        let postIndex = posts.findIndex(item => item._id === data.postID);

        if (postIndex < 0) return;

        let postToUpdate = {...posts[postIndex]}
        let likes = {...postToUpdate.likes}


        if (isLiked) {
            postToUpdate.realtimeLike = data.personData
            likes.count += 1
        } else {
            postToUpdate.realtimeUnlike = data.personData
            likes.count -= 1
        }

        postToUpdate.likes = {...likes}
        posts[postIndex] = postToUpdate;

        this.setState({posts})
    }


    reqRecived = (event) => {
        let user = {...this.state.user}
        user.reqRecieved = false
        user.isMyFriend = false
        user.reqRecieved = true
        this.setState({user})
    }

    reqAccepted = (event) => {
        let user = {...this.state.user}
        user.reqRecieved = false
        user.reqSent = false
        user.isMyFriend = true
        this.setState({user})
    }

    reqDeclined = (event) => {
        let user = {...this.state.user}
        user.reqRecieved = false
        user.reqSent = false
        user.isMyFriend = false
        this.setState({user})
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



    loadPosts = () => {

        let id = this.props.match.params.id;

        this.setState({
            isLoading: true
        })

        axios.get(
            "/getProfilePosts",
            {
                params: {
                    profileID: id,
                    postsLoaded: this.state.posts.length
                }
            })
            .then(result => {

                this.setState((prevState) => {
                    return {
                        posts: [...prevState.posts, ...result.data.posts],
                        maxPost: result.data.max
                    }
                })

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

    loadMore = (e) => {

        if (
            window.innerHeight + document.documentElement.scrollTop === document.scrollingElement.scrollHeight
            && this.state.maxPost !== this.state.posts.length
            && !this.state.isLoading
        ) {
            this.loadPosts();
        }
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


    updateUser = (property, value) => {
        let user = {...this.state.user};
        user[property] = value;

        this.setState({
            user
        })
    }


    setResponsePreview = (status, msg) => {
        this.setState({
            responseMsg: msg,
            responseStatus: status
        })
    }


    render() {


        if (this.state.shouldRedirect)
            return <Redirect to="/"/>

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


                {/*<Header setResponsePreview={this.setResponsePreview}/>*/}

                <div className="home__container d-flex flex-row justify-end">


                    <div className="mainPage">

                        <div className="mainPage__container">


                            <ProfileHeader
                                user={this.state.user}
                                updateUser={this.updateUser}
                                addNewPost={this.addNewPost}
                                setResponsePreview={this.setResponsePreview}
                            />


                            <div className="mainPage__body">


                                <div className="mainPage__body__posts">

                                    {
                                        this.props.match.params?.id === localStorage.getItem("userID") ?
                                            <CreateNewPost
                                                placeholder={"write something..."}
                                                addNewPost={this.addNewPost}
                                                setResponsePreview={this.setResponsePreview}
                                                user={this.state.user}
                                            /> : null
                                    }


                                    {
                                        this.state.posts.map(post =>
                                            <FeedPost
                                                key={post._id}
                                                post={post}
                                                removePost={this.removePost}
                                                myUser={this.state.myUser}
                                                setResponsePreview={this.setResponsePreview}
                                                commentLikeUpdate={
                                                    this.state.commentLikeUpdate?.postID === post._id ? this.state.commentLikeUpdate : null
                                                }
                                                commentUpdate={
                                                    this.state.commentAdded?.postID === post._id ? this.state.commentAdded : null
                                                }
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


                                <div className="mainPage__body__about">

                                    <h3>About</h3>

                                    {
                                        this.state.user.dob ?
                                            <p className="mainPage__body__about__item bday">
                                                Born on&nbsp;
                                                <span>
                                                    {new Date(this.state.user.dob).toLocaleDateString(undefined, {
                                                        year: "numeric", month: "short", day: "numeric"
                                                    })
                                                    }
                                                </span>
                                            </p>
                                            : null
                                    }

                                    {
                                        this.state.user.gender ?
                                            <p className="mainPage__body__about__item bday">
                                                Gender&nbsp;<span>{this.state.user.gender.toLocaleUpperCase()}</span>
                                            </p>
                                            : null
                                    }

                                    <p className="mainPage__body__about__item bday">
                                        <Link to={"/friends/" + this.state.user._id}>See Friends
                                            of {this.state.user.firstName}</Link>
                                    </p>


                                    {/*<p className="mainPage__body__about__item liveIn">*/}
                                    {/*    Lives in <j to={'/'}>Lahore,Pakistan</j>*/}
                                    {/*</p>*/}

                                    {/*<p className="mainPage__body__about__item work">*/}
                                    {/*    Work at <j to={'/'}>ABC Villas</j>*/}
                                    {/*</p>*/}

                                    {/*<p className="mainPage__body__about__item study">*/}
                                    {/*    Studied at <j to={'/'}>Ahmad Hassan Polytechnic</j>*/}
                                    {/*</p>*/}


                                </div>


                            </div>


                        </div>


                    </div>

                </div>

            </FillScreen>
        );

    }

}


export default Profile;
