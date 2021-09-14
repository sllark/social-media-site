const {Server} = require('socket.io')

const {verifyToken} = require('./isAuth')
const getChatId = require('./getChatID')

const Message = require('../model/Message');
const User = require('../model/User');
const {redisClient, llenAsync, smembersAsync} = require('./redis')
const {FRONTEND_URL} = require('../config/keys')

let io = null;

const initiate = (server) => {

    // "https://social-media-site-react.vercel.app/"
    io = new Server(server, {
        cors: {
            origin: FRONTEND_URL,
            methods: ["GET", "POST"]
        }
    });


    io.on('connection', async (socket) => {


        socket.on('join', async (data) => {

            const isAuth = verifyToken(data.token);

            if (!isAuth) {
                socket.emit('wrongToken');
                socket.disconnect(true);
                return
            }

            socket.userID = isAuth.userID;
            socket.join(isAuth.userID);

            redisClient.lpush(isAuth.userID, socket.id);
            let user = await User.findById(isAuth.userID);
            user.isOnline = true;
            await user.save();

            notifyFriends('userOnline', isAuth.userID);
        });

        socket.on('chat message', async (msg) => {
            let chatID = getChatId(msg.to, msg.from);
            socket.in(msg.to).emit('new chat message', msg);

            let newMsg = new Message({
                chatID: chatID,
                to: msg.to,
                from: msg.from,
                value: msg.value,
                isRead: false,
            })

            await newMsg.save()

            let userTo = await User.findById(msg.to).select("conersationWith");
            userTo.conersationWith = userTo.conersationWith.filter(item => item.toString() !== msg.from.toString());
            userTo.conersationWith.splice(0,0,msg.from);
            await userTo.save()

            let userFrom = await User.findById(msg.from).select("conersationWith");
            userFrom.conersationWith = userFrom.conersationWith.filter(item => item.toString() !== msg.to.toString());
            console.log(userFrom.conersationWith)
            userFrom.conersationWith.splice(0,0,msg.to);
            await userFrom.save()


        })

        socket.on('typingStart', async (data) => {
            socket.in(data.to).emit('notifyTypingStart');
        })

        socket.on('typingStop', async (data) => {
            socket.in(data.to).emit('notifyTypingStop');
        })

        socket.on('disconnect', async () => {
            if (!socket.userID) return;

            redisClient.lrem(socket.userID, 1, socket.id);
            let length = await llenAsync(socket.userID);

            if (Number(length) === 0) {
                socket.emit("offline", socket.userID);

                let user = await User.findById(socket.userID);
                user.isOnline = false;
                await user.save();

                notifyFriends('userOffline', socket.userID);


                let userFetchedPosts = await smembersAsync(socket.userID + "-posts");

                // removing user data from redis
                userFetchedPosts.forEach(item => {
                    redisClient.srem(item.toString(), socket.userID.toString());
                })
                redisClient.del(socket.userID + "-posts");

            }
        });


    })
}

const getIO = () => io;


let notifyFriends = async (eventType, myID) => {


    let user = await User.findById(myID).select('firstName lastName profilePicture isOnline friends').lean()


    let friends = [...user.friends];
    delete user.friends;


    if (eventType !== "userOnline") {
        // delete user.firstName;
        delete user.lastName;
        delete user.profilePicture;
        delete user.isOnline;
    }


    friends.forEach(friendID => {
        io.in(friendID.toString()).emit(eventType, user)
    })

}


module.exports = {
    initiate,
    getIO
}

