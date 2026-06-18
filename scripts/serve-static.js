const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(process.argv[2] || "build");
const port = Number(process.env.PORT || process.argv[3] || 3000);
const host = process.env.HOST || "127.0.0.1";
const publicPath = process.env.PUBLIC_URL_PATH || "/sut-and-sna";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

const indexPath = path.join(root, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error(
    `Could not find ${indexPath}. Run yarn build before serving e2e assets.`
  );
  process.exit(1);
}

const sendFile = (res, filePath) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end("Internal server error");
      return;
    }

    res.writeHead(200, {
      "Content-Type":
        contentTypes[path.extname(filePath)] || "application/octet-stream",
    });
    res.end(content);
  });
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${host}:${port}`);
  let requestedPath = decodeURIComponent(url.pathname);

  if (
    requestedPath === publicPath ||
    requestedPath.startsWith(`${publicPath}/`)
  ) {
    requestedPath = requestedPath.slice(publicPath.length) || "/";
  }

  let filePath = path.join(root, requestedPath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (requestedPath.endsWith("/")) {
    filePath = path.join(filePath, "index.html");
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, filePath);
      return;
    }

    sendFile(res, indexPath);
  });
});

server.listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 500).unref();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
