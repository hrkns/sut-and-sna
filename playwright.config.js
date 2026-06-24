const { defineConfig, devices } = require("@playwright/test");

const ciBrowserOptions = process.env.CI ? { channel: "chrome" } : {};
const videoMode = process.env.CI ? "off" : "retain-on-failure";

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["list"], ["junit", { outputFile: "test-results/e2e-junit.xml" }]]
    : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: videoMode,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...ciBrowserOptions },
    },
  ],
});
