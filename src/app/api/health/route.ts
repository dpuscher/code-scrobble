import { sql } from 'drizzle-orm';
import { getDb } from '@/server/db';

export async function GET() {
  try {
    await getDb().execute(sql`select 1`);
    return Response.json({ status: 'ok', revision: process.env.APP_REVISION ?? 'dev' });
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503 });
  }
}
