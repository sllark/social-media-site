import React from "react";

import axios from "../helper/axios";

import FillScreen from "../components/FillScreen";
import Sidebar from "../components/general/Sidebar";
import Person from "../components/profile/Person";
import Loading from "../components/ui/Loading";
import ShowResponse from "../components/ui/ShowResponse";
import handleAxiosError from "../helper/handleAxiosError";


class Search extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            users: [],
            isLoading: true,
            query: "",
            responseMsg: "",
            responseStatus: "",
            loadedAll: false
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevProps.location.search !== this.props.location.search) {
            this.setState({users: []})
            this.loadResult(true);
        }

    }

    componentDidMount() {
        this.loadResult(true);
    }

    getQuery = (locationQuery) => {
        let params = new URLSearchParams(locationQuery);
        return params.get('q');
    }

    loadResult = (queryUpdated) => {
        let query = this.getQuery(this.props.location.search);

        if (query === "") return;

        this.setState({
            isLoading: true
        })

        axios.get(
            "/getSearchUsers",
            {
                params: {
                    queryString: query,
                    userLoaded: queryUpdated ? 0 : this.state.users.length,
                }
            })
            .then(result => {

                this.setState(prevState => {
                    return {
                        users: [...prevState.users, ...result.data.users],
                        loadedAll: !(result.data.users.length > 0)
                    }
                })

            })
            .catch(error => {
                console.log(error);
                handleAxiosError(error,this.setResponsePreview,"Loading Failed.")

            })
            .then(() => {

                this.setState({
                    isLoading: false
                })

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


                <div className="home__container d-flex flex-row justify-end">




                    <div className="mainPage">

                        <div className="mainPage__container">


                            <div className="mainPage__body flex-column">


                                <h2 className="h-2 mt-1 w-100">People</h2>


                                <div className="personList">


                                    {
                                        this.state.users.map(
                                            (user, index) =>
                                                <Person
                                                    key={user._id}
                                                    user={user}
                                                />)
                                    }


                                    {
                                        this.state.isLoading ?
                                            <Loading flexStart={true}/>
                                            : null
                                    }


                                    {
                                        !this.state.loadedAll ?
                                            <button
                                                className="btn btn--transparent mt-1"
                                                onClick={() => this.loadResult(false)}
                                                disabled={this.state.users.length < 1}
                                            >Load more
                                            </button> :
                                            this.state.users.length===0 ?
                                                <p className='infoHeading textSecondary'>
                                                    No Matching user found for the query
                                                </p> :
                                                <span className="infoHeading textLeft textSmall mt-1">No more users to load</span>
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


export default Search;
