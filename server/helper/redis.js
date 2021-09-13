const redis = require('redis');
const {promisify} = require('util');

let client;

if (process.env.REDIS_URL){
    client= redis.createClient({url : process.env.REDIS_URL});
}else
    client= redis.createClient();



client.flushall();

const llenAsync = promisify(client.llen).bind(client);
const smembersAsync = promisify(client.smembers).bind(client);

client.on("error", function (error) {
    console.error(error);
});

client.on('connect', function () {
    console.log('Redis Connected!');
});




module.exports = {
    redisClient:client,
    llenAsync,
    smembersAsync
}