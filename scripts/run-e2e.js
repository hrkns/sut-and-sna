const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const host = "127.0.0.1";
const port = 3000;
const root = "build";
const serverScript = path.join(__dirname, "serve-static.js");

const waitForServer = () => {
  const startedAt = Date.now();
  let lastError = "no response yet";

  return new Promise((resolve, reject) => {
    const poll = () => {
      const req = http.get(`http://${host}:${port}`, (res) => {
        res.resume();

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
          return;
        }

        lastError = `last response status was ${res.statusCode}`;
        if (Date.now() - startedAt > 120000) {
          reject(
            new Error(
              `Timed out waiting for http://${host}:${port}: ${lastError}`
            )
          );
          return;
        }

        setTimeout(poll, 250);
      });

      req.on("error", (err) => {
        lastError = err.message;
        if (Date.now() - startedAt > 120000) {
          reject(
            new Error(
              `Timed out waiting for http://${host}:${port}: ${lastError}`
            )
          );
          return;
        }

        setTimeout(poll, 250);
      });
    };

    poll();
  });
};

const server = spawn(process.execPath, [serverScript, root, String(port)], {
  env: {
    ...process.env,
    HOST: host,
    PORT: String(port),
  },
  stdio: "inherit",
});

const shutdownServer = () => {
  if (!server.killed) {
    server.kill("SIGTERM");
  }
};

const run = async () => {
  try {
    await waitForServer();

    const playwrightCli = require.resolve("@playwright/test/cli");
    const test = spawn(
      process.execPath,
      [playwrightCli, "test", ...process.argv.slice(2)],
      {
        env: process.env,
        stdio: "inherit",
      }
    );

    test.on("exit", (code, signal) => {
      shutdownServer();
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }

      process.exit(code || 0);
    });
  } catch (err) {
    shutdownServer();
    console.error(err);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  shutdownServer();
  process.exit(130);
});

process.on("SIGTERM", () => {
  shutdownServer();
  process.exit(143);
});

server.on("exit", (code) => {
  if (code && code !== 0) {
    process.exit(code);
  }
});

server.on("error", (err) => {
  console.error(
    `Failed to start e2e static server (${serverScript}): ${err.message}`
  );
  process.exit(1);
});

run();
