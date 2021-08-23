import React from "react";


import FillScreen from "../components/FillScreen";
import Header from "../components/header/Header";
import CreateNewPost from "../components/feed/CreateNewPost";
import FeedPost from "../components/feed/FeedPost";
import Sidebar from "../components/general/Sidebar";
import SidebarOnline from "../components/general/SidebarOnline";
import Loading from "../components/ui/Loading";
import configs from "../assets/config/configs";

class Feed extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            posts: [],
            nextPageLoad: 1,
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

    loadMore = (e) => {

        if (
            window.innerHeight + document.documentElement.scrollTop === document.scrollingElement.scrollHeight
            && this.state.maxPost !== this.state.posts.length
            && !this.state.isLoading
        ) {
            this.loadFeedPosts(this.state.nextPageLoad);
        }
    }

    loadFeedPosts = (pageNum = 1) => {


        this.setState({
            isLoading: true
        })

        let link = configs.api_url+"/getFeedPosts?pageNum=" + pageNum;

        fetch(link, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        })
            .then(resp => resp.json())
            .then(result => {

                if (result.error)
                    throw new Error(JSON.stringify(result));


                console.log(result)


                if (result.message === "success") {
                    this.setState((prevState) => {
                        return {
                            posts: [...prevState.posts, ...result.posts],
                            nextPageLoad: prevState.nextPageLoad + 1,
                        }
                    })
                }

            })
            .catch(error => {
                // let errorObject = JSON.parse(error.message);
                console.log(error);

            })
            .finally(() => {
                this.setState({
                    isLoading: false
                })
            })

    }


    getFeedPostsCount = (pageNum = 1) => {


        let link = configs.api_url+"/getFeedPostsCount";

        fetch(link, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        })
            .then(resp => resp.json())
            .then(result => {

                if (result.error)
                    throw new Error(JSON.stringify(result));

                if (result.message === "success")
                    this.setState({maxPost: result.max})

            })
            .catch(error => {
                // let errorObject = JSON.parse(error.message);
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

        console.log(postIndex)
        console.log(posts)
        this.setState(prevState => {
            return {
                posts,
                maxPost: prevState.maxPost - 1,
            }
        })


    }

    render() {

        // console.log(this.props.token)

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
