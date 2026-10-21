import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: [
    {
      command: 'node node_modules/next/dist/bin/next start --hostname 127.0.0.1',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: { AI_PROVIDER: 'openai', OPENAI_API_KEY: '', OPENAI_MODEL: '' },
    },
    {
      command: 'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3101',
      url: 'http://127.0.0.1:3101',
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
