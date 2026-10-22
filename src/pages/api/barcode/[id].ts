import { authenticatedApi } from '@/server/api';
import { findByBarcode, findByDiscogsId, toReleaseJSON } from '@/server/releases';
import { isAutoScrobble } from '@/server/users';

// `id` is either a scanned barcode or `id:<discogs release id>`.
export default authenticatedApi({
  GET: async (req, res, user) => {
    const param = String(req.query.id);
    const discogsId = param.startsWith('id:') ? Number(param.slice(3)) : null;
    const release = discogsId !== null
      ? (Number.isInteger(discogsId) && discogsId > 0 ? await findByDiscogsId(discogsId) : null)
      : await findByBarcode(param);
    if (!release) return res.json({});

    const instantScrobble = await isAutoScrobble(user.id, release.id);
    return res.json({ instantScrobble, ...toReleaseJSON(release) });
  },
});
