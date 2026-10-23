import { isSearchFormat } from '@/lib/formats';
import { authenticatedApi } from '@/server/api';
import { findVersions } from '@/server/releases';

export default authenticatedApi({
  GET: async (req, res) => {
    const id = Number(req.query.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });
    const { format } = req.query;
    return res.json(await findVersions(id, isSearchFormat(format) ? format : null));
  },
});
