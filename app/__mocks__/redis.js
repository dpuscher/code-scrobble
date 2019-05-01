/* eslint-disable no-underscore-dangle */

const redis = require('redis-mock');

const client = redis.createClient();
client.get = jest.fn(client.get);
client.set = jest.fn(client.set);

redis.createClient = () => client;

redis._get = client.get;
redis._set = client.set;
redis._reset = client.flushall;

module.exports = redis;
