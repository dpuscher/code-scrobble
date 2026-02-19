const { createClient } = require('redis');

const client = createClient({ url: process.env.REDISCLOUD_URL });
client.connect().catch(console.error);
client.on('error', console.error);

module.exports = {
  set: (key, value, ttl = 86400) => (
    client.set(key, JSON.stringify(value), { EX: ttl })
  ),

  get: async (key) => {
    const value = await client.get(key);
    if (value) {
      return JSON.parse(value);
    }
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject();
  },
};
