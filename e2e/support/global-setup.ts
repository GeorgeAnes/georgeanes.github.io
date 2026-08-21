import { execSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { PREVIEW_PORT, PREVIEW_URL } from './constants';

/**
 * Astro 7 auto-backgrounds `astro preview` whenever stdout is not a TTY, so
 * Playwright's built-in `webServer` always sees the process exit immediately.
 * We drive Astro's own background lifecycle instead and poll for readiness.
 */
export default async function globalSetup() {
  execSync('npx astro build', { stdio: 'inherit' });

  try {
    execSync('npx astro preview stop', { stdio: 'ignore' });
  } catch {
    // No server was running. Expected on a clean run.
  }

  execSync(`npx astro preview --background --port ${PREVIEW_PORT}`, { stdio: 'inherit' });

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(PREVIEW_URL);
      if (response.ok) return;
    } catch {
      // Server not accepting connections yet.
    }
    await sleep(250);
  }

  throw new Error(`Preview server did not become ready at ${PREVIEW_URL} within 60s`);
}
