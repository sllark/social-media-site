const express = require('express');
const {body} = require('express-validator')
const asyncHandler = require('express-async-handler')

const {isAuth} = require('../helper/isAuth')
const validateObjectID = require('../helper/validateObjectID')
const awsControllers = require('../controllers/awsControllers')

const router = express.Router();


router.get('/getSignS3', isAuth, asyncHandler(awsControllers.getSign))



module.exports = router;