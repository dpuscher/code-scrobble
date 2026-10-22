import { authenticatedApi } from '@/server/api';
import { toSessionJSON } from '@/server/users';

export default authenticatedApi({
  GET: (_req, res, user) => res.json(toSessionJSON(user)),
});
