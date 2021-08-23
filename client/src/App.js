import React from "react"
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"
import io from "socket.io-client";

import configs from "./assets/config/configs";

import './assets/sass/main.scss'

import Home from './containers/Home'
import Login from './containers/Login'
import Feed from './containers/Feed'
import Profile from './containers/Profile'
import Friends from './containers/Friends'
import Search from './containers/Search'
import Messanger from './containers/Messanger'
import About from './containers/About'


class App extends React.Component {

    state = {
        token: "",
        userID: "",
        socket: null
    }

    componentDidMount() {
        this.socket = io.connect(configs.api_url, {transport: ['websocket']})

        this.socket.emit('join', {
            token: localStorage.getItem('token')
        })

        this.socket.on('disconnect', (msg) => {
            console.log('disconnected');
        })

        this.socket.on('wrongToken', (msg) => {
            console.log('wrong token detected');
            alert("Authentication Failed!!! Please login first");
        })

        this.setState({socket: this.socket})


        let token = localStorage.getItem("token"),
            userID = localStorage.getItem("userID");

        if (token && userID)
            this.setState({token, userID})
    }

    updateToken = ({token, userID}) => {
        this.setState({token, userID})
    }


    render() {

        return (
            <Router>

                <Switch>
                    <Route path="/about">
                        <About token={this.state.token} userID={this.state.userID}/>
                    </Route>
                    <Route path="/login">
                        <Login
                            token={this.state.token}
                            userID={this.state.userID}
                            updateToken={this.updateToken}
                        />
                    </Route>
                    <Route path="/feed">
                        <Feed token={this.state.token} userID={this.state.userID}/>
                    </Route>
                    {/*<Route path="/profile">*/}
                    {/*    <Profile token={this.state.token} userID={this.state.userID}/>*/}
                    {/*</Route>*/}

                    <Route path="/profile/:id" render={(props) => <Profile {...props} key={props.match.params.id}/>}
                    />

                    <Route path="/friends">
                        <Friends token={this.state.token} userID={this.state.userID}/>
                    </Route>
                    <Route path="/search">
                        <Search token={this.state.token} userID={this.state.userID}/>
                    </Route>
                    <Route path="/messanger/:id"
                           render={(props) =>
                               <Messanger  {...props} key={props.match.params.id} socket={this.state.socket}/>
                           }
                    />
                    <Route path="/">
                        <Home/>
                    </Route>
                </Switch>

            </Router>
        )

    }

}


export default App;
