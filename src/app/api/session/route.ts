import { authenticated, json } from '@/server/api';
import { toSessionJSON } from '@/server/users';

export const GET = authenticated((_request, user) => json(toSessionJSON(user)));
