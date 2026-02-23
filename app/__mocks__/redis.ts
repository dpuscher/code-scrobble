/* eslint-disable no-underscore-dangle */

const store = new Map();

const mockGet = jest.fn(async key => store.get(key) || null);
const mockSet = jest.fn(async (key, value) => {
  store.set(key, value);
  return "OK";
});
const mockConnect = jest.fn(async () => {});
const mockOn = jest.fn();

const createClient = jest.fn(() => ({
  get: mockGet,
  set: mockSet,
  connect: mockConnect,
  on: mockOn,
}));

module.exports = {
  createClient,
  _get: mockGet,
  _set: mockSet,
  _reset: () => store.clear(),
};
