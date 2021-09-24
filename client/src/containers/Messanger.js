import React from "react";

import FillScreen from "../components/FillScreen";
import Message from "../components/messanger/Message";
import TextEditor from "../components/general/TextEditor";
import MessagerHeader from "../components/messanger/MessagerHeader";
import Loading from "../components/ui/Loading";
import ShowResponse from "../components/ui/ShowResponse";


import axios from "../helper/axios";
import getProfileDetails from "../helper/getProfileDetails";
import handleAxiosError from "../helper/handleAxiosError";


class Messanger extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            maxMessages: 0,
            isLoading: false,
            addedNewMsg: false,
            addedOldMsg: false,
            oldestDate: null, // oldestDate save date for loaded messages
            newestDate: null, // newestDate save date for new messages
            floatDate: null,
            datesCount: 0,
            otherUserTyping: false,
            myProfile: {},
            otherUserProfile: {
                firstName: ".",
                lastName: ".",
            },
            responseMsg: "",
            responseStatus: "",
        }

        this.socket = undefined;
        this.messangerBodyRef = React.createRef();
        this._isMounted = false;
        this.prevScrollHeight = 0;
        this.typingTimeout = undefined
    }

    async componentDidMount() {
        document.documentElement.style.overflowY = "unset";
        this._isMounted = true

        this.scrollEvent = this.messangerBodyRef.current.querySelector('.messanger__messagesCont').addEventListener('scroll', this.msgContScroll);

        this.getMessagesCount()
        this.getOldMessages();

        if (this.props.socket) this.addSocketEvents();


        let myID = await getProfileDetails(localStorage.getItem("userID"))
        this.setState({myProfile: myID})
        let otherID = await getProfileDetails(this.props.match.params.id)
        this.setState({otherUserProfile: otherID})


    }

    componentDidUpdate(prevProps, prevState, snapshot) {


        if (!prevProps.socket) {
            this.addSocketEvents();
        }

        if (prevState.messages.length === this.state.messages.length) return;

        if (this.state.addedNewMsg || this.state.messages.length <= 15) {
            this.moveScrollToBottom();
            this.setState({addedNewMsg: false})
        } else if (this.state.addedOldMsg) {

            let ele = this.messangerBodyRef.current.querySelector('.messanger__messagesCont'),
                currentHeight = ele.scrollHeight,
                scrollTop = ele.scrollTop;

            if (currentHeight > this.prevScrollHeight) {
                ele.scrollTop = scrollTop + (currentHeight - this.prevScrollHeight);
            }

            this.setState({addedOldMsg: false})
        }

        this.prevScrollHeight = this.messangerBodyRef.current.querySelector('.messanger__messagesCont').scrollHeight;
    }

    componentWillUnmount() {
        document.documentElement.style.overflowY = "scroll";
        this.removeSocketEvents();

        this.messangerBodyRef.current.querySelector('.messanger__messagesCont').removeEventListener('scroll', this.msgContScroll)
    }


    addSocketEvents = () => {
        this.props.socket.on('new chat message', (msg) => {
            this.props.addNewMessage(msg);

            if (this.props.match.params.id === msg.from) {
                this.addNewMsg({value: msg.value});
            }

        })

        this.props.socket.on('notifyTypingStart', (msg) => {
            this.setState({otherUserTyping: true})
        })
        this.props.socket.on('notifyTypingStop', (msg) => {
            this.setState({otherUserTyping: false})
        })
    }

    removeSocketEvents = () => {
        this.props.socket.off('new chat message')
        this.props.socket.off('notifyTypingStart')
        this.props.socket.off('notifyTypingStop')
    }

    msgContScroll = (e) => {
        this.updateFloatingDate(e);
        this.loadMore(e);
    }

    updateFloatingDate = (e) => {
        let msgs = e.target.querySelectorAll('.message');
        for (let i = 0; i < msgs.length; i++) {
            let rects = msgs[i].getClientRects()[0];
            if (rects.top - rects.height > 0) {
                this.setState({floatDate: new Date(Number(msgs[i].dataset.date))})
                break;
            }
        }
    }

    loadMore = (e) => {

        if (e.target.scrollTop <= 1 && !this.state.isLoading && this.state.maxMessages !== this.state.messages.length
        ) {
            this.getOldMessages(this.state.messages.length - this.state.datesCount);
        }
    }

    getMessagesCount = () => {

        axios.get(
            "/getMessagesCount",
            {
                params: {
                    to: this.props.match.params.id,
                    from: localStorage.getItem('userID')
                }
            })
            .then(result => {
                if (result.data.message === "success")
                    this.setState({maxMessages: result.data.max})
            })
            .catch(error => {
                console.log(error);
                handleAxiosError(error, this.setResponsePreview, "Unable to load old messages...")
            })

    }

    getOldMessages = (msgsCount = 0) => {


        this.setState({
            isLoading: true
        })

        axios.get(
            "/getMessages",
            {
                params: {
                    to: this.props.match.params.id,
                    from: localStorage.getItem('userID'),
                    msgsCount: msgsCount
                }
            })
            .then(result => {
                result.data.messages.forEach(msg => {
                    this.addNewMsg(msg, msg.from === localStorage.getItem('userID'), false)
                })
            })
            .catch(error => {
                handleAxiosError(error, this.setResponsePreview, "Unable to load old messages...")

            })
            .then(() => {
                if (!this._isMounted) return
                this.setState({
                    isLoading: false
                })
            })


    }

    postMsg = (value, clearValue) => {

        let msgObj = {
            value: value,
            to: this.props.match.params.id,
            from: localStorage.getItem('userID')
        };

        if (this.props.socket) this.props.socket.emit('chat message', msgObj);
        this.addNewMsg({value}, true);
        this.props.addNewMessage(msgObj);
        clearValue();
    }

    addNewMsg = (msg, own = false, isNewMsg = true) => {
        if (!this._isMounted) return

        let msgObj = {
            value: msg.value,
            own: own,
            createdAt: isNewMsg ? new Date().getTime() : new Date(msg.createdAt).getTime(),
            isLast: this.state.messages.length + 1 === this.state.maxMessages
        }

        let isSameDay = true,
            oldestDate,
            newestDate,
            msgInc = 1;


        if (isNewMsg) {
            newestDate = new Date(msgObj.createdAt)
            isSameDay = datesAreOnSameDay(newestDate, this.state.newestDate || new Date(null))

            if (!this.state.oldestDate) oldestDate = new Date(msgObj.createdAt)
        } else {
            oldestDate = new Date(msgObj.createdAt)
            isSameDay = datesAreOnSameDay(oldestDate, this.state.oldestDate || new Date(null))

            //if loading msg from db, then set first msg (most recent) date to newest date
            if (!this.state.newestDate) newestDate = new Date(msgObj.createdAt)
        }

        this.setState((prevState) => {

            let messages = [...prevState.messages];


            // add new date in messages
            if (!this.state.oldestDate || !isSameDay) {
                let dateObj = {
                    type: 'date',
                    date: new Date(msgObj.createdAt),
                    value: msgObj.createdAt
                };

                isNewMsg ? messages.push(dateObj) : messages.splice(0, 0, dateObj);
                msgInc = 2;
            }

            isNewMsg ? messages.push(msgObj) : messages.splice(1, 0, msgObj);


            // (we get max from server, total old messages) if new msg and new day then increment by 2 (add new msg and date) else if msg is old but day is not same increment max by 1 (add date in msgs array ) else if msg is old and day is same them keep the old max
            const maxMessages = isNewMsg ? prevState.maxMessages + msgInc : msgInc > 1 ? prevState.maxMessages + 1 : prevState.maxMessages

            return {
                messages: messages,
                maxMessages: maxMessages,
                addedNewMsg: isNewMsg,
                addedOldMsg: !isNewMsg,
                oldestDate: oldestDate || prevState.oldestDate,
                newestDate: newestDate || prevState.newestDate,
                datesCount: msgInc > 1 ? prevState.datesCount + 1 : prevState.datesCount,
            }

        })

    }

    moveScrollToBottom = () => {
        if (!this.messangerBodyRef.current) return;
        let msgCont = this.messangerBodyRef.current.querySelector('.messanger__messagesCont');
        msgCont.scrollTop = msgCont.scrollHeight - msgCont.clientHeight;
    }

    typingStart = () => {
        if (!this.props.socket) return

        if (this.typingTimeout !== undefined) clearTimeout(this.typingTimeout);
        else {
            this.props.socket.emit('typingStart', {
                to: this.props.match.params.id,
                from: localStorage.getItem('userID')
            });
        }

        this.typingTimeout = setTimeout(this.typingStop, 400);
    }

    typingStop = () => {
        if (!this.props.socket) return
        this.props.socket.emit('typingStop', {
            to: this.props.match.params.id,
            from: localStorage.getItem('userID')
        });

        clearTimeout(this.typingTimeout)
        this.typingTimeout = undefined;
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

                <div className="home__container d-flex flex-row justify-center">


                    <div className="messanger" ref={this.messangerBodyRef}>

                        {/*<MessagerHeader/MessagerHeader>*/}
                        <MessagerHeader user={this.state.otherUserProfile} isTyping={this.state.otherUserTyping}/>

                        <div className="messanger__messagesCont">

                            {
                                this.state.isLoading ? <Loading/> : false
                            }
                            {this.state.messages.length > 0 && this.state.floatDate ?
                                <div className="message__day dateFloat">
                                    {this.state.floatDate.toLocaleDateString(undefined, {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric"
                                    })}
                                </div>
                                : null}
                            {
                                this.state.messages.map((msg, index) => {
                                    return <Message msg={msg}
                                                    key={msg.value + index}
                                                    profile={msg.own ? this.state.myProfile : this.state.otherUserProfile}/>;
                                })
                            }
                            <div className="scrollBottom"/>
                        </div>

                        <div className="messanger__editor">

                            <TextEditor
                                post={this.postMsg}
                                placeholder="Type Message..."
                                onKeyPress={this.typingStart}
                                profile={this.state.myProfile}
                            />

                            <p>
                                {this.state.otherUserTyping ? ` ${this.state.otherUserProfile.firstName} is typing...` : ""}
                            </p>
                        </div>

                    </div>


                </div>

            </FillScreen>
        );

    }

}


const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();


export default Messanger;
