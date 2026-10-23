import { isSearchFormat } from '@/lib/formats';
import { authenticatedApi } from '@/server/api';
import { search } from '@/server/releases';

export default authenticatedApi({
  GET: async (req, res) => {
    const { format } = req.query;
    res.json(await search(String(req.query.query), isSearchFormat(format) ? format : null));
  },
});
