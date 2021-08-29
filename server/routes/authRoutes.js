const express = require('express');
const {body} = require('express-validator')
const asyncHandler = require('express-async-handler')

const User = require('../model/User')
const authController = require('../controllers/authControllers')

const router = express.Router();


router.post('/signup',
    [
        body('email').isEmail().withMessage('Please enter a valid email.').custom(email => {
            return User.findOne({email: email})
                .then(fetchedUser => {

                    if (fetchedUser)
                        return Promise.reject('Email already exist!');
                    else
                        return true;
                })
        }).normalizeEmail(),
        body('password').not().isEmpty().isLength({min: 6}).withMessage('Password too short.'),
        body('firstName').not().isEmpty().isLength({min: 1}).withMessage('First Name not found.'),
        body('lastName').not().isEmpty().isLength({min: 1}).withMessage('Last Name not found.'),
        body('dob').not().isEmpty().isLength({min: 1}).withMessage('Date of Birth not found.'),
        body('gender').not().isEmpty().isLength({min: 1}).withMessage('Gender not found.')
    ]
    , asyncHandler(authController.signup))


router.post('/login',
    [
        body('email').isEmail().withMessage('Please enter a valid email.').custom(email => {

            return User.findOne({email: email})
                .then(fetchedUser => {

                    if (!fetchedUser)
                        return Promise.reject('Email or Password does not match.');
                    else
                        return true;
                })
        }).normalizeEmail(),
        body('password').not().isEmpty().isLength({min: 6}).withMessage('Password too short.')
    ], asyncHandler(authController.login))

module.exports = router;
