import { isSearchFormat } from '@/lib/formats';
import { authenticated, json } from '@/server/api';
import { findVersions } from '@/server/releases';

export const GET = authenticated<{ id: string }>(async (request, _user, params) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Invalid id' }, 400);
  const format = request.nextUrl.searchParams.get('format');
  return json(await findVersions(id, isSearchFormat(format) ? format : null));
});
