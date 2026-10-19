// Servidor sin dependencias: sirve la app y comparte los pedidos entre móviles.
// Uso: node server.js   (PORT y DATA_FILE opcionales)
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data.json");

let db = {};
try { db = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } catch {}
const persist = () => fs.writeFile(DATA_FILE, JSON.stringify(db), () => {});

const clients = new Set();
const broadcast = () => {
  const msg = `data: ${JSON.stringify(db)}\n\n`;
  for (const res of clients) res.write(msg);
};

function apply(op) {
  const m = String(op.mesa);
  if (op.type === "add") {
    const d = Math.trunc(op.d);
    if (!op.key || !Number.isFinite(d)) return;
    db[m] = db[m] || {};
    db[m][op.key] = Math.max(0, (db[m][op.key] || 0) + d);
    if (!db[m][op.key]) delete db[m][op.key];
    if (!Object.keys(db[m]).length) delete db[m];
  } else if (op.type === "clear") {
    delete db[m];
  }
}

const json = (res, code, body) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  if (req.method === "GET" && url === "/api/state") return json(res, 200, db);

  if (req.method === "GET" && url === "/api/stream") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    res.write(`data: ${JSON.stringify(db)}\n\n`);
    clients.add(res);
    const ping = setInterval(() => res.write(": ping\n\n"), 25000);
    req.on("close", () => { clearInterval(ping); clients.delete(res); });
    return;
  }

  if (req.method === "POST" && url === "/api/op") {
    let body = "";
    req.on("data", c => { body += c; if (body.length > 1e4) req.destroy(); });
    req.on("end", () => {
      try { apply(JSON.parse(body)); } catch { return json(res, 400, { error: "bad op" }); }
      persist(); broadcast();
      json(res, 200, db);
    });
    return;
  }

  if (req.method === "GET" && (url === "/" || url === "/index.html")) {
    return fs.readFile(path.join(__dirname, "index.html"), (err, buf) => {
      if (err) return json(res, 500, { error: "no index" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(buf);
    });
  }

  json(res, 404, { error: "not found" });
}).listen(PORT, "0.0.0.0", () => console.log(`Frankfurt en http://localhost:${PORT}`));
