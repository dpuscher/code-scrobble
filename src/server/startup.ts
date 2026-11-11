import { runStartupTasks } from './db/migrate';

export async function runStartup() {
  if (!process.env.DATABASE_URL) return;
  try {
    await runStartupTasks(process.env.DATABASE_URL);
  } catch (error) {
    // Serving requests without a migrated database is pointless; exit so the
    // orchestrator restarts the container and keeps the old one running.
    console.error('Startup tasks failed', error);
    process.exit(1);
  }
}
