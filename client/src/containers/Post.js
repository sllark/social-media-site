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
        }

    }

    componentDidMount() {
        this.getMyUser()
    }


    getMyUser = () => {

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
                                    setResponsePreview={this.setResponsePreview}
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
