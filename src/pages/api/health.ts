import { sql } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@/server/db';

export default async function health(_req: NextApiRequest, res: NextApiResponse) {
  try {
    await getDb().execute(sql`select 1`);
    res.status(200).json({ status: 'ok', revision: process.env.APP_REVISION ?? 'dev' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
}
