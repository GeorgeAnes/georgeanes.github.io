import { execSync } from 'node:child_process';

export default function globalTeardown() {
  try {
    execSync('npx astro preview stop', { stdio: 'ignore' });
  } catch {
    // Already stopped.
  }
}
