// Runs once when the Next.js server starts, before it handles any request.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || !process.env.DATABASE_URL) return;
  const { runStartupTasks } = await import('./server/db/migrate');
  try {
    await runStartupTasks(process.env.DATABASE_URL, process.env.MONGODB_URI);
  } catch (error) {
    // Serving requests without a migrated database is pointless; exit so the
    // orchestrator restarts the container and keeps the old one running.
    console.error('Startup tasks failed', error);
    process.exit(1);
  }
}
