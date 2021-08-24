require('dotenv').config()
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const {Server} = require('socket.io')
var redis = require('redis');
const {promisify} = require('util');


const authRoutes = require('./routes/authRoutes')
const postRoutes = require('./routes/postRoutes')
const {verifyToken} = require('./helper/isAuth')

const Message = require('./model/Message');

const getChatId = require('./helper/getChatID')

const MONGOURI = 'mongodb://127.0.0.1:27017/focial?gssapiServiceName=mongodb';
const app = express();
const client = redis.createClient();

client.on("error", function (error) {
    console.error(error);
});

client.on('connect', function () {
    console.log('Connected!');
});

client.flushall();

const getAsync = promisify(client.get).bind(client);
const lrangeAsync = promisify(client.lrange).bind(client);
const lpushAsync = promisify(client.lpush).bind(client);
const lremAsync = promisify(client.lrem).bind(client);
const llenAsync = promisify(client.llen).bind(client);
// client.set("name", "abdul")


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 10);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
})


app.use(bodyParser.json());
app.use(multer({storage: storage}).single('imageFile'));
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use((req, res, next) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
})


app.get('/', (req, res, next) => {

    res.json({message: "hello"});

})
app.use(authRoutes)
app.use(postRoutes)


app.use((error, req, res, next) => {

    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;


    if (error.errors) {
        res.status(status).json({
            message: message,
            error: error.errors
        })
    } else {
        res.status(status).json({
            message: message
        })
    }


    res.status(500);

})


mongoose.connect(MONGOURI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })


console.log('connected! at post 3344')
let server = app.listen(3344)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


let onlineUsers = {};

io.on('connection', (socket) => {
    // console.log('a user connected');

    socket.on('disconnect', async () => {
        // console.log(socket.userID)
        if (!socket.userID) return;

        let length = await llenAsync(socket.userID);
        if (Number(length) === 0) return

        client.lrem(socket.userID, 1, socket.id);
        // console.log('user closed a connection');

        length = await llenAsync(socket.userID);
        if (Number(length) === 0) {
            socket.emit("offline", socket.userID);
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

        client.lpush(isAuth.userID, socket.id);
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