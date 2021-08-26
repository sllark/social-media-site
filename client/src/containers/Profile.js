import React from "react";
import {Link, Redirect} from "react-router-dom";


import FillScreen from "../components/FillScreen";
import Header from "../components/header/Header";
import CreateNewPost from "../components/feed/CreateNewPost";
import ProfileHeader from "../components/profile/ProfileHeader";
import FeedPost from "../components/feed/FeedPost";
import Sidebar from "../components/general/Sidebar";
import Loading from "../components/ui/Loading";
import axios from "../helper/axios";

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
                lastName: "."
            }
        }

        this.scrollEvent = null;

    }


    componentDidMount() {

        if (this.props.match.params.id) {
            this.getUser();
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


    getUser = () => {
        let id = this.props.match.params.id;

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
                console.log(error);
            })
            .finally(() => {
                this.setState({
                    isLoading: false
                })
            })


    }

    loadPosts = () => {

        let id = this.props.match.params.id;

        this.setState({
            isLoading: true
        })

        axios.get(
            "/getPosts",
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
                console.log(error);
            })
            .finally(() => {
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

    updateBio = (bio) => {

        let user = {...this.state.user};
        user.bio = bio;

        this.setState({
            user
        })

    }

    sendFriendReq = () => {

        if (this.state.user.reqSent) return;

        let id = this.props.match.params.id;


        axios.post(
            "/sendFriendReq",
            JSON.stringify({
                userID: id
            }))
            .then(result => {

                if (result.data.message === "success") {
                    let user = {...this.state.user};
                    user.reqSent = true;
                    this.setState({user})
                }

            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                this.setState({
                    isLoading: false
                })
            })


    }

    cancelReq = () => {

        if (!this.state.user.reqSent) return;

        let id = this.props.match.params.id;


        axios.post(
            "/cancelFriendReq",
            JSON.stringify({
                userID: id
            }))
            .then(result => {

                if (result.data.message === "success" || result.data.errorMessage === "No Request to cancel") {
                    let user = {...this.state.user};
                    user.reqSent = false;
                    this.setState({user})
                }

            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                this.setState({
                    isLoading: false
                })
            })


    }

    render() {


        if (this.state.shouldRedirect)
            return <Redirect to="/"/>

        return (
            <FillScreen class="bg-light">

                <Header user={this.state.user}/>

                <div className="home__container d-flex flex-row justify-end">


                    <Sidebar/>


                    <div className="mainPage">

                        <div className="mainPage__container">


                            <ProfileHeader
                                user={this.state.user}
                                updateBio={this.updateBio}
                                sendReq={this.sendFriendReq}
                                cancelReq={this.cancelReq}
                                addNewPost={this.addNewPost}
                            />


                            <div className="mainPage__body">


                                <div className="mainPage__body__posts">

                                    {
                                        this.props.match.params?.id === localStorage.getItem("userID") ?
                                            <CreateNewPost
                                                placeholder={"write something..."}
                                                token={localStorage.getItem("token")}
                                                addNewPost={this.addNewPost}
                                            /> : null
                                    }


                                    {
                                        this.state.posts.map(post =>
                                            <FeedPost
                                                key={post._id}
                                                post={post}
                                                removePost={this.removePost}/>)
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


                                    <p className="mainPage__body__about__item liveIn">
                                        Lives in <Link to={'/'}>Lahore,Pakistan</Link>
                                    </p>

                                    <p className="mainPage__body__about__item work">
                                        Work at <Link to={'/'}>ABC Villas</Link>
                                    </p>

                                    <p className="mainPage__body__about__item study">
                                        Studied at <Link to={'/'}>Ahmad Hassan Polytechnic</Link>
                                    </p>


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
