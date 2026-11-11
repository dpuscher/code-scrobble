import { createSession } from '@/server/session';
import { createUser } from './factories';
import { startRequest } from './next';

/** Creates a user with a session, and starts a request with its `sid` cookie. */
export async function loggedInUser(overrides: Parameters<typeof createUser>[0] = {}) {
  const user = await createUser(overrides);
  const cookies = { sid: await createSession(user.id) };
  startRequest(cookies);
  return { user, cookies };
}
