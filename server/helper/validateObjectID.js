const mongoose = require('mongoose')
const express = require('express');
const {body,check} = require('express-validator')


const validateObjectID = (field) => [
    check(field.toString()).custom(id => {
        let isValid = mongoose.isValidObjectId(id);
        if (!isValid)
            throw new Error('Invalid Post ID.');
        else
            return true;
    })
]

module.exports = validateObjectID;