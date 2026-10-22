import type { ServerResponse } from 'node:http';
import { createSession } from '@/server/session';
import { createUser } from './factories';

/** Creates a user with a session and returns the `sid` cookie value. */
export async function loggedInUser(overrides: Parameters<typeof createUser>[0] = {}) {
  const user = await createUser(overrides);
  let header = '';
  await createSession({ appendHeader: (_: string, v: string) => { header = v; } } as unknown as ServerResponse, user.id);
  return { user, cookies: { sid: /^sid=([^;]*)/.exec(header)![1] } };
}
