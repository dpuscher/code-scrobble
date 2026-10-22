import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import type { User } from './db/schema';
import { getSessionUser } from './session';
import { toSessionJSON } from './users';

export type SessionProps = { session: ReturnType<typeof toSessionJSON> };

/** getServerSideProps for pages that need a logged-in user. */
export function requireUser<P extends Record<string, unknown> = Record<string, never>>(
  getProps: (ctx: GetServerSidePropsContext, user: User) => P = () => ({} as P),
): GetServerSideProps<P & SessionProps> {
  return async (ctx) => {
    const user = await getSessionUser(ctx.req, ctx.res);
    if (!user) return { redirect: { destination: '/login', permanent: false } };
    return { props: { ...getProps(ctx, user), session: toSessionJSON(user) } };
  };
}

/** getServerSideProps for pages only anonymous visitors should see. */
export const requireAnonymous: GetServerSideProps = async ({ req }) => {
  const user = await getSessionUser(req);
  return user ? { redirect: { destination: '/', permanent: false } } : { props: {} };
};
