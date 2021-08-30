import React from "react";


import FillScreen from "../components/FillScreen";
import Person from "../components/profile/Person";
import Loading from "../components/ui/Loading";
import ProfileHeader from "../components/profile/ProfileHeader";
import ShowResponse from "../components/ui/ShowResponse";
import axios from "../helper/axios";
import handleAxiosError from "../helper/handleAxiosError";


class Profile extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            friends: [],
            friendsCount: 0,
            user: {
                firstName: ".",
                lastName: "."
            },
            responseMsg: "",
            responseStatus: ""
        }
    }

    componentDidMount() {
        this.getUser();
        this.getFriendsCount()
        this.loadFriends()
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
                    profileID: id || localStorage.getItem("userID"),
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


    loadFriends = () => {
        let id = this.props.match.params.id;


        this.setState({
            isLoading: true
        })

        axios.get("/getFriends", {
            params: {
                profileID: id || localStorage.getItem("userID"),
                loadedFriends: this.state.friends.length
            }
        })
            .then(result => {

                this.setState(prevState => {

                    return {
                        friends: [...prevState.friends, ...result.data.friends]
                    }

                })

            })
            .catch(error => {
                handleAxiosError(error, this.setResponsePreview, "Failed to load friends...")

            })
            .then(() => {
                this.setState({
                    isLoading: false
                })
            })


    }


    getFriendsCount = () => {
        let id = this.props.match.params.id;

        axios.get("/getFriendsCount", {
            params: {
                profileID: id || localStorage.getItem("userID"),
            }
        })
            .then(result => {

                this.setState(prevState => {
                    return {
                        friendsCount: result.data.friendsCount
                    }
                })

            })
            .catch(error => {
                handleAxiosError(error, this.setResponsePreview, "Failed to load friends...")

            })


    }


    loadMore = (e) => {

        if (!this.state.isLoading && this.state.friendsCount !== this.state.friends.length)
            this.loadFriends()

    }

    updateUser = (property,value) => {
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
                                addNewPost={emptyFn}
                                setResponsePreview={this.setResponsePreview}
                                friendsHeader={true}
                            />

                            <div className="mainPage__body flex-column">


                                <h2 className="h-2 w-100">Friends</h2>


                                <div className="personList">


                                    {
                                        this.state.friends.map(
                                            (friend, index) =>
                                                <Person
                                                    key={friend._id}
                                                    user={friend}
                                                />
                                        )
                                    }


                                    {
                                        this.state.isLoading ?
                                            <Loading flexStart={true}/> :
                                            this.state.friendsCount !== this.state.friends.length ?
                                                <button
                                                    className="btn btn--transparent mt-1"
                                                    onClick={this.loadMore}
                                                    disabled={this.state.friends.length < 1}
                                                >Load more
                                                </button> : null
                                    }


                                </div>


                            </div>


                        </div>


                    </div>

                </div>

            </FillScreen>
        );

    }

}

let emptyFn = () => {
}


export default Profile;
