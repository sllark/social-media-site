const {Server} = require('socket.io')

const {verifyToken} = require('./isAuth')
const getChatId = require('./getChatID')

const Message = require('../model/Message');
const User = require('../model/User');
const {redisClient, llenAsync} = require('./redis')


let io = null;

const initiate=(server) => {

    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });


    io.on('connection', async (socket) => {
        // console.log('a user connected');


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

            notifyFriends('userOnline',isAuth.userID);
        });

        socket.on('chat message', async (msg) => {
            console.log('message=', msg)
            let chatID = getChatId(msg.to, msg.from);
            console.log('message=', chatID);

            let newMsg = new Message({
                chatID: chatID,
                to: msg.to,
                from: msg.from,
                value: msg.value,
                isRead: false,
            })

            await newMsg.save()

            socket.in(msg.to).emit('new chat message', msg);
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

                notifyFriends('userOffline',socket.userID);
            }
        });


    })
}

const getIO = () => io;



let notifyFriends = async (eventType, myID) => {



    let user = await User.findById(myID).select('firstName lastName profilePicture isOnline friends').lean()


    let friends = [...user.friends];
    delete user.friends;


    if (eventType!=="userOnline"){
        // delete user.firstName;
        delete user.lastName;
        delete user.profilePicture;
        delete user.isOnline;
    }


    friends.forEach(friendID => {
        io.in(friendID.toString()).emit(eventType, user)
    })

}


module.exports={
    initiate,
    getIO
}

