import React from "react";


import FillScreen from "../components/FillScreen";
import Header from "../components/header/Header";
import CreateNewPost from "../components/feed/CreateNewPost";
import FeedPost from "../components/feed/FeedPost";
import Sidebar from "../components/general/Sidebar";
import SidebarOnline from "../components/general/SidebarOnline";
import Loading from "../components/ui/Loading";
import axios from "../helper/axios";

class Feed extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            posts: [],
            maxPost: 1,
            isLoading: false
        }

        this.scrollEvent = null;

    }

    componentDidMount() {

        this.scrollEvent = window.addEventListener('scroll', this.loadMore);
        this.getFeedPostsCount()
        this.loadFeedPosts()

    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.loadMore);
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
                console.log(error);
            })
            .finally(() => {
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
                console.log(error);
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

    render() {


        return (
            <FillScreen class="bg-light">

                <Header/>

                <div className="home__container d-flex flex-row justify-center">


                    <Sidebar/>


                    <div className="feed">
                        <CreateNewPost
                            placeholder={"write something..."}
                            token={this.props.token}
                            addNewPost={this.addNewPost}
                        />

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

                    <SidebarOnline/>

                </div>

            </FillScreen>
        );

    }

}


export default Feed;
