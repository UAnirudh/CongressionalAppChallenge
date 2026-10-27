import { defineConfig, devices } from '@playwright/test';
const port = Number(process.env.E2E_PORT || 3200);
const nvidiaPort = Number(process.env.E2E_NVIDIA_PORT || 3201);
const visionPort = Number(process.env.E2E_VISION_PORT || 3202);
const reuseExistingServer = !process.env.CI && process.env.E2E_REUSE_SERVER === 'true';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: Number(process.env.PW_WORKERS || (process.env.CI ? 2 : 4)),
  use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: [
    {
      command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${port}`,
      url: `http://127.0.0.1:${port}`,
      reuseExistingServer,
      timeout: 120000,
      env: {
        AI_PROVIDER: 'openai',
        OPENAI_API_KEY: '',
        OPENAI_MODEL: '',
        GROQ_API_KEY: '',
        GROQ_MODEL: '',
      },
    },
    {
      command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${nvidiaPort}`,
      url: `http://127.0.0.1:${nvidiaPort}`,
      reuseExistingServer,
      timeout: 120000,
      env: {
        AI_PROVIDER: 'nvidia',
        NVIDIA_MODEL: 'openai/gpt-oss-20b',
        NVIDIA_API_KEY: 'e2e-placeholder-not-a-real-key',
        GROQ_API_KEY: '',
        GROQ_MODEL: '',
      },
    },
    {
      command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${visionPort}`,
      url: `http://127.0.0.1:${visionPort}`,
      reuseExistingServer,
      timeout: 120000,
      env: {
        AI_PROVIDER: 'nvidia',
        NVIDIA_MODEL: 'openai/gpt-oss-20b',
        NVIDIA_API_KEY: 'e2e-placeholder-not-a-real-key',
        GROQ_API_KEY: 'e2e-vision-placeholder-not-a-real-key',
        GROQ_MODEL: 'qwen/qwen3.8-27b',
      },
    },
  ],
});
