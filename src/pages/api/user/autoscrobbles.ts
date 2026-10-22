import { authenticatedApi } from '@/server/api';
import { listAutoScrobbles, removeAutoScrobble } from '@/server/users';

export default authenticatedApi({
  GET: async (_req, res, user) => res.json(await listAutoScrobbles(user.id)),
  DELETE: async (req, res, user) => {
    const id = Number(req.body?.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    await removeAutoScrobble(user.id, id);
    return res.status(204).end();
  },
});
