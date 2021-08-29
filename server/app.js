require('dotenv').config()
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');

const getSocket = require('./helper/socket')

const authRoutes = require('./routes/authRoutes')
const postRoutes = require('./routes/postRoutes')
const profileRoutes = require('./routes/profileRoutes')
const messageRoutes = require('./routes/messageRoutes')



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
    // console.log(getSocket.getIO());
    res.json({message: 'hello'});

})
app.use(authRoutes)
app.use(postRoutes)
app.use(profileRoutes)
app.use(messageRoutes)


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

getSocket.initiate(server);
