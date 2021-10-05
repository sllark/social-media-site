const aws = require('aws-sdk');
const mongoose = require('mongoose')
const {validationResult} = require('express-validator');

const Message = require('../model/Message');
const User = require('../model/User');
const getChatID = require('../helper/getChatID');


const {S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY} = require('../config/keys')

aws.config.update({region: 'us-east-2'});

exports.getSign = async (req, res, next) => {

    const s3 = new aws.S3({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    });

    const fileName = req.query['fileName'];
    const fileType = req.query['fileType'];

    const s3Params = {
        Bucket: S3_BUCKET_NAME,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };

   let data = s3.getSignedUrl('putObject', s3Params);

    const returnData = {
        signedRequest: data,
        url: `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`
    };

    res.status(200).json({
        result: returnData
    })

}
