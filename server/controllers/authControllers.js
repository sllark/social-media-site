const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/User');


exports.signup = (req, res, next) => {

    const {firstName, lastName, gender, email, dob, password} = req.body;

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;

    }

    bcrypt.hash(password, 12)
        .then(hash => {


            let newUser = new User({
                firstName,
                lastName,
                gender,
                email,
                dob,
                password: hash
            });

            newUser.save()
                .then(result => {
                    res.status(200).json({'message': "success", userID: result._id});
                })

        })
        .catch(err => {
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        })

}


exports.login = (req, res, next) => {

    const {email, password} = req.body;
    const validation = validationResult(req)


    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;

    }


    let fetchedUser;
    User.findOne({email: email})
        .then(user => {

            fetchedUser = user;
            return bcrypt.compare(password, user.password)

        })
        .then(isEqual => {


            if (!isEqual) {
                const error = new Error('Email or Password does not match.');
                error.statusCode = 401;
                error.errors = validation.array();
                throw error;
            }


            let payload = {
                email,
                userID: fetchedUser._id.toString()
            }


            jwt.sign(payload, process.env.JWT_SECRET, (error, token) => {
                if (error) throw new Error('internal Error');

                res.status(200)
                    .json({
                        token: token,
                        userID: fetchedUser._id.toString(),
                        name: `${fetchedUser.firstName} ${fetchedUser.lastName}`
                    });
            })


        })
        .catch(err => {
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        })


}

