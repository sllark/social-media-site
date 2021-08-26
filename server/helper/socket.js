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


    io.on('connection', (socket) => {
        // console.log('a user connected');

        socket.on('disconnect', async () => {
            if (!socket.userID) return;

            redisClient.lrem(socket.userID, 1, socket.id);
            let length = await llenAsync(socket.userID);

            if (Number(length) === 0) {
                socket.emit("offline", socket.userID);

                let user = await User.findById(socket.userID);
                user.isOnline = false;
                user.save();

                // console.log('user disconnected');
            }
        });

        socket.on('join', async (data) => {

            const isAuth = verifyToken(data.token);

            if (!isAuth) {
                socket.emit('wrongToken');
                socket.disconnect(true);
                return
            }

            socket.userID = isAuth.userID;
            // console.log(socket.userID)

            redisClient.lpush(isAuth.userID, socket.id);
            let user = await User.findById(isAuth.userID);
            user.isOnline = true;
            user.save();
            socket.join(isAuth.userID);

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


    })
}

const getIO = () => io;

module.exports={
    initiate,
    getIO
}

