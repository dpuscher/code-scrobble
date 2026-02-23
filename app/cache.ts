import { createClient } from 'redis';

const client = createClient({ url: process.env.REDISCLOUD_URL });
client.connect().catch(console.error);
client.on('error', console.error);

export const set = (key: string, value: unknown, ttl = 86400) =>
  client.set(key, JSON.stringify(value), { EX: ttl });

export const get = async <T = unknown>(key: string): Promise<T> => {
  const value = await client.get(key);
  if (value) {
    return JSON.parse(value as string) as T;
  }
  // eslint-disable-next-line prefer-promise-reject-errors
  return Promise.reject();
};
