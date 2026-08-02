import { defineConfig, devices } from '@playwright/test'

/**
 * Two projects:
 *  - `e2e`   : browser tests against the locally-served static export (`out/`).
 *              Run `pnpm build` first; this is the "what would Cloudflare
 *              actually serve" check, and what CI runs before any deploy.
 *  - `smoke` : request-only checks against a deployed URL (`SMOKE_BASE_URL`).
 *              These verify what only the platform can add: security headers
 *              from `_headers`, redirects from `_redirects`, real HTTP.
 *
 * Run: `pnpm test:e2e` / `SMOKE_BASE_URL=https://your.site pnpm test:smoke`.
 */
const E2E_PORT = 4321
const E2E_BASE_URL = `http://127.0.0.1:${E2E_PORT}`
const SMOKE_BASE_URL = process.env.SMOKE_BASE_URL

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  expect: { timeout: 10_000 },

  projects: [
    {
      name: 'e2e',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: E2E_BASE_URL },
    },
    {
      name: 'smoke',
      testMatch: /smoke\/.*\.spec\.ts/,
      use: { baseURL: SMOKE_BASE_URL },
    },
  ],

  // Only the e2e project needs a server; serve the static export from `out/`.
  // `serve` honours clean URLs (/blog/post/ → blog/post/index.html) and 404.html.
  webServer: SMOKE_BASE_URL
    ? undefined
    : {
        command: `npx --yes serve out -l ${E2E_PORT} --no-clipboard`,
        url: E2E_BASE_URL,
        timeout: 60_000,
        reuseExistingServer: !process.env.CI,
      },
})
