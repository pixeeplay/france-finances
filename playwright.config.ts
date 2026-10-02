import { defineConfig, devices } from "@playwright/test";

/**
 * E2E_PORT : port du serveur teste (3000 par defaut).
 * E2E_PROD=1 : teste un build de prod (`npm run build` au prealable) via `next start`
 * au lieu du serveur de dev.
 */
const PORT = Number(process.env.E2E_PORT) || 3000;
const BASE_URL = `http://localhost:${PORT}`;
const PROD = process.env.E2E_PROD === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: PROD ? `npx next start -p ${PORT}` : `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: PROD ? 30_000 : 120_000,
  },
});
