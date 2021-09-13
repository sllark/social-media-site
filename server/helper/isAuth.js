const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys')


const isAuth = (req, res, next) => {

    let authHeader = req.get('Authorization')

    if (!authHeader) {
        const error = new Error('Not Authorized');
        error.statusCode = 401;
        throw error;
    }

    let decode;
    try {
        decode = jwt.verify(authHeader, JWT_SECRET)
    } catch (error) {
        error.message = 'Not Authorized';
        error.statusCode = 401;
        throw error;
    }


    req.user = decode
    next()

}


const verifyToken = (token) => {

    let isTrueToken = false;


    try {
        decode = jwt.verify(token, JWT_SECRET)
        return decode
    } catch (error) {
        return false;
    }


}


module.exports = {
    isAuth,
    verifyToken
}