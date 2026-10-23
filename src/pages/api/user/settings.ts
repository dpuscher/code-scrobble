import { isSearchFormat } from '@/lib/formats';
import { authenticatedApi } from '@/server/api';
import { setSearchFormat } from '@/server/users';

export default authenticatedApi({
  POST: async (req, res, user) => {
    const searchFormat = req.body?.searchFormat ?? null;
    if (searchFormat !== null && !isSearchFormat(searchFormat)) {
      return res.status(400).json({ error: 'Invalid search format' });
    }
    await setSearchFormat(user.id, searchFormat);
    return res.status(204).end();
  },
});
