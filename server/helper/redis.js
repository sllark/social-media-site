const redis = require('redis');
const {promisify} = require('util');

const client = redis.createClient();

client.flushall();

const llenAsync = promisify(client.llen).bind(client);

client.on("error", function (error) {
    console.error(error);
});

client.on('connect', function () {
    console.log('Redis Connected!');
});




module.exports = {
    redisClient:client,
    llenAsync
}