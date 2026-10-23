import { isSearchFormat } from '@/lib/formats';
import { authenticated, json } from '@/server/api';
import { search } from '@/server/releases';

// Route handler params come decoded already.
export const GET = authenticated<{ query: string }>(async (request, _user, { query }) => {
  const format = request.nextUrl.searchParams.get('format');
  return json(await search(query, isSearchFormat(format) ? format : null));
});
