import { defineConfig, devices } from '@playwright/test';
const port = Number(process.env.E2E_PORT || 3000);
const nvidiaPort = Number(process.env.E2E_NVIDIA_PORT || 3101);
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: [
    {
      command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${port}`,
      url: `http://127.0.0.1:${port}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: { AI_PROVIDER: 'openai', OPENAI_API_KEY: '', OPENAI_MODEL: '' },
    },
    {
      command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${nvidiaPort}`,
      url: `http://127.0.0.1:${nvidiaPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        AI_PROVIDER: 'nvidia',
        NVIDIA_MODEL: 'openai/gpt-oss-20b',
        NVIDIA_API_KEY: 'e2e-placeholder-not-a-real-key',
      },
    },
  ],
});
