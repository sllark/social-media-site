import React from "react"
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"
import io from "socket.io-client";

import PrivateRoute from './helper/PrivateRoute'
import configs from "./assets/config/configs";

import './assets/sass/main.scss'

import Layout from "./components/ui/Layout";

import Signup from './containers/Signup'
import Login from './containers/Login'
import Feed from './containers/Feed'
import Profile from './containers/Profile'
import Friends from './containers/Friends'
import Search from './containers/Search'
import Messanger from './containers/Messanger'
import Post from './containers/Post'
import About from './containers/About'


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            token: "",
            userID: "",
        }

        this.socket = undefined
    }

    componentDidMount() {
        this.socket = io.connect(configs.api_url, {transport: ['websocket']})

        this.joinSocket(this.socket)

        this.socket.on('disconnect', (msg) => {
            console.log('disconnected');
        })

        this.socket.on('wrongToken', (msg) => {
            console.log('wrong token detected');
            // alert("Authentication Failed!!! Please login first");
        })


        let token = localStorage.getItem("token"),
            userID = localStorage.getItem("userID");

        if (token && userID)
            this.setState({token, userID})
    }

    joinSocket = (socket) => {

        socket.emit('join', {
            token: localStorage.getItem('token')
        })

    }

    updateToken = (data) => {

        localStorage.setItem('token', data.token)
        localStorage.setItem('userID', data.userID)
        localStorage.setItem('name', data.name)

        this.socket.connect()
        this.joinSocket(this.socket)

        this.setState({token: data.token, userID: data.userID})
    }


    render() {

        return (
            <Router>

                <Switch>
                    <Route path="/about">
                        <Layout>
                            <About/>
                        </Layout>
                    </Route>
                    <Route path="/login">
                        <Login updateToken={this.updateToken}/>
                    </Route>
                    <Route path="/signup">
                        <Signup updateToken={this.updateToken}/>
                    </Route>
                    <PrivateRoute path="/feed"
                                  render={props =>
                                      <Layout {...props}>
                                          <Feed token={this.state.token} userID={this.state.userID}/>
                                      </Layout>
                                  }/>

                    <PrivateRoute path="/profile/:id"
                                  render={(props) =>
                                      <Layout {...props} hideOnlineSidebar={true}>
                                          <Profile key={props.match.params.id}  {...props}/>
                                      </Layout>}
                    />

                    <PrivateRoute path="/friends/:id"
                                  render={
                                      props =>
                                          <Layout {...props} hideOnlineSidebar={true}>
                                              <Friends  {...props} key={props.match.params.id}/>
                                          </Layout>
                                  }
                    />

                    <PrivateRoute path="/friends"
                                  render={
                                      props =>
                                          <Layout {...props} hideOnlineSidebar={true}>
                                              <Friends  {...props}/>
                                          </Layout>}
                    />


                    <PrivateRoute path="/post/:id"
                                  render={
                                      props =>
                                          <Layout {...props}>
                                              <Post  {...props} key={props.match.params.id}/>
                                          </Layout>
                                  }
                    />

                    <PrivateRoute path="/search" render={
                        props =>
                            <Layout {...props} >
                                <Search {...props}/>
                            </Layout>}
                    />

                    <PrivateRoute path="/messanger/:id"
                                  render={(props) =>
                                      <Layout {...props} >
                                          <Messanger key={props.match.params.id}  {...props} socket={this.socket}/>
                                      </Layout>
                                  }
                    />
                    <Route path="/">
                        <Login updateToken={this.updateToken}/>
                    </Route>
                </Switch>

            </Router>
        )

    }

}


export default App;
