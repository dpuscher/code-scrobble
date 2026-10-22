import { authenticatedApi } from '@/server/api';
import { search } from '@/server/releases';

export default authenticatedApi({
  GET: async (req, res) => res.json(await search(String(req.query.query))),
});
