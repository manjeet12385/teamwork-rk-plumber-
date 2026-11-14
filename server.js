const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const handleRequest = (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method Not Allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400);
    response.end("Bad Request");
    return;
  }

  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  const targetPath = pathname.endsWith("/") ? path.join(filePath, "index.html") : filePath;
  fs.stat(targetPath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404);
      response.end("Not Found");
      return;
    }

    response.writeHead(200, {
      "Content-Length": stats.size,
      "Content-Type": mimeTypes[path.extname(targetPath).toLowerCase()] || "application/octet-stream",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    const stream = fs.createReadStream(targetPath);
    stream.on("error", (error) => {
      console.error(`Unable to read ${targetPath}:`, error);
      if (!response.headersSent) {
        response.writeHead(500);
      }
      response.end("Internal Server Error");
    });
    stream.pipe(response);
  });
};

function startServer(port) {
  const server = http.createServer(handleRequest);

  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && port < 3100) {
      console.log(`Port ${port} is already in use; trying port ${port + 1}.`);
      startServer(port + 1);
      return;
    }

    console.error(`Unable to start development server on port ${port}:`, error.message);
    process.exitCode = 1;
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`Development server running at http://127.0.0.1:${port}`);
  });
}

startServer(3000);
