import { authenticatedApi } from '@/server/api';
import { findByBarcode, findByDiscogsId, toReleaseJSON } from '@/server/releases';
import { toSelection } from '@/lib/parts';
import { findAutoScrobble } from '@/server/users';

// `id` is either a scanned barcode or `id:<discogs release id>`.
export default authenticatedApi({
  GET: async (req, res, user) => {
    const param = String(req.query.id);
    const discogsId = param.startsWith('id:') ? Number(param.slice(3)) : null;
    const release = discogsId !== null
      ? (Number.isInteger(discogsId) && discogsId > 0 ? await findByDiscogsId(discogsId) : null)
      : await findByBarcode(param);
    if (!release) return res.json({});

    const json = toReleaseJSON(release);
    const autoScrobble = await findAutoScrobble(user.id, release.id);
    // Saved parts the release no longer has are dropped; none left means the default.
    const instantParts = toSelection(json.parts, autoScrobble?.parts);
    return res.json({
      instantScrobble: Boolean(autoScrobble),
      instantParts: instantParts?.length ? instantParts : null,
      ...json,
    });
  },
});
