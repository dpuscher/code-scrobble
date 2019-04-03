const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient(process.env.REDISCLOUD_URL);

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

module.exports = {
  set: (key, value, ttl = 86400) => (
    setAsync(key, JSON.stringify(value), 'EX', ttl)
  ),

  get: key => (
    new Promise(async (resolve, reject) => {
      const value = await getAsync(key);
      if (value) {
        resolve(JSON.parse(value));
      } else {
        reject();
      }
    })
  ),
};
