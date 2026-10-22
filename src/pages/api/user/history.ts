import { authenticatedApi } from '@/server/api';
import { listHistory } from '@/server/users';

export default authenticatedApi({
  GET: async (_req, res, user) => res.json(await listHistory(user.id)),
});
