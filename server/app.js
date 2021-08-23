require('dotenv').config()
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const {Server} = require('socket.io')


const authRoutes = require('./routes/authRoutes')
const postRoutes = require('./routes/postRoutes')
const {verifyToken} = require('./helper/isAuth')

const Message = require('./model/Message');

const getChatId = require('./helper/getChatID')

const MONGOURI = 'mongodb://127.0.0.1:27017/focial?gssapiServiceName=mongodb';
const app = express();


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

const io = new Server(server,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


let onlineUsers = {};

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {

        console.log(onlineUsers);
        if (!onlineUsers[socket.userID]) return

        let currentIdIndex = onlineUsers[socket.userID].findIndex(id=>id === socket.id);

        if (currentIdIndex>=0){
            onlineUsers[socket.userID].splice(currentIdIndex,1);
        }

        console.log('user closed a connection');

        if (onlineUsers[socket.userID].length === 0) {
            socket.emit("offline", socket.userID);
            delete onlineUsers[socket.userID]
            console.log('user disconnected');
        }

        console.log(onlineUsers)

    });

    socket.on('join', (data) => {

        const isAuth = verifyToken(data.token);

        if (!isAuth) {
            socket.emit('wrongToken');
            socket.disconnect(true);
            return
        }

        if (!onlineUsers[isAuth.userID])  onlineUsers[isAuth.userID] = []

        socket.userID = isAuth.userID;
        onlineUsers[isAuth.userID].push(socket.id);

        socket.join(isAuth.userID);
    });

    socket.on('chat message',async (msg)=>{
        console.log('message=',msg)
        let chatID = getChatId(msg.to,msg.from);
        console.log('message=',chatID);

        let newMsg = new Message({
            chatID:chatID,
            to:msg.to,
            from:msg.from,
            value:msg.value,
            isRead:false,
        })

        await newMsg.save()

        socket.in(msg.to).emit('new chat message', msg);
    })

    socket.on('typingStart',async (data)=>{
        socket.in(data.to).emit('notifyTypingStart');
    })

    socket.on('typingStop',async (data)=>{
        socket.in(data.to).emit('notifyTypingStop');
    })


})