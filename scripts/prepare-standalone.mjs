// Mirrors the Docker image layout for `.next/standalone`: Next.js leaves
// static assets, public files and our SQL migrations out of the standalone
// output, so copy them in to run it locally (used by the e2e tests).
import { cpSync } from 'node:fs';

const target = '.next/standalone';
cpSync('public', `${target}/public`, { recursive: true });
cpSync('.next/static', `${target}/.next/static`, { recursive: true });
cpSync('drizzle', `${target}/drizzle`, { recursive: true });
