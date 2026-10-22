// Runs once when the Next.js server starts, before it handles any request.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runStartup } = await import('./server/startup');
    await runStartup();
  }
}
