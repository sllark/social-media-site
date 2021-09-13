const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/User');
const {JWT_SECRET} = require('../config/keys')


exports.signup = async (req, res, next) => {

    const {firstName, lastName, gender, email, dob, password} = req.body;

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;

        return next(error);
    }

    let hash = await bcrypt.hash(password, 12)

    let newUser = new User({
        firstName,
        lastName,
        gender,
        email,
        dob,
        password: hash
    });

    let user = await newUser.save()

    let payload = {
        email,
        userID: user._id.toString()
    }


    jwt.sign(payload, JWT_SECRET, (error, token) => {
        if (error) throw new Error('internal Error');

        res.status(200)
            .json({
                'message': "success",
                token: token,
                userID: user._id.toString(),
                name: `${user.firstName} ${user.lastName}`
            });
    })

}


exports.login = async (req, res, next) => {

    const {email, password} = req.body;
    const validation = validationResult(req)


    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error)
    }


    let fetchedUser;
    let user = await User.findOne({email: email})
    let isEqual = await bcrypt.compare(password, user.password)

    if (!isEqual) {
        const error = new Error('Email or Password does not match.');
        error.statusCode = 401;
        error.errors = validation.array();
        return next(error);
    }


    let payload = {
        email,
        userID: user._id.toString()
    }


    jwt.sign(payload, JWT_SECRET, (error, token) => {
        if (error) return next(new Error('Internal Server Error'));

        res.status(200)
            .json({
                token: token,
                userID: user._id.toString(),
                name: `${user.firstName} ${user.lastName}`
            });
    })


}

