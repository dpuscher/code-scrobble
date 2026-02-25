const store = new Map<string, string>();

export const _get = vi.fn(async (key: string) => store.get(key) || null);
export const _set = vi.fn(async (key: string, value: string) => {
  store.set(key, value);
  return "OK";
});
const mockConnect = vi.fn(async () => {});
const mockOn = vi.fn();

export const createClient = vi.fn(() => ({
  get: _get,
  set: _set,
  connect: mockConnect,
  on: mockOn,
}));

export const _reset = () => store.clear();
