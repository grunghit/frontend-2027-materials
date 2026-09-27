/**
 * Zero-dependency static file server.
 *
 * Used by: the slide export pipeline (decktape needs an http:// URL), the grading harness
 * (submissions must be served over http — file:// breaks fetch, ES modules and
 * origin-scoped localStorage, which is exactly the rule we teach students in week 1),
 * and the CI check runner.
 *
 * As a module:  const srv = await startServer({ root: './x' }); srv.url; await srv.close();
 * As a CLI:     node tools/lib/static-server.mjs --root . --port 5173
 */
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

/**
 * @param {{root: string, port?: number, host?: string}} opts
 * @returns {Promise<{url: string, port: number, root: string, close: () => Promise<void>}>}
 */
export async function startServer({ root, port = 0, host = '127.0.0.1' }) {
  const absRoot = path.resolve(root);

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${host}`);
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith('/')) rel += 'index.html';

      // Path traversal guard — a submission could contain ../ links.
      const target = path.resolve(absRoot, '.' + rel);
      if (target !== absRoot && !target.startsWith(absRoot + path.sep)) {
        res.writeHead(403).end('Forbidden');
        return;
      }

      let info;
      try {
        info = await stat(target);
      } catch {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404 Not Found');
        return;
      }

      if (info.isDirectory()) {
        res.writeHead(301, { location: rel + '/' }).end();
        return;
      }

      res.writeHead(200, {
        'content-type': MIME[path.extname(target).toLowerCase()] ?? 'application/octet-stream',
        'content-length': info.size,
        'cache-control': 'no-store',
      });
      createReadStream(target).pipe(res);
    } catch (err) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }).end(String(err));
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });

  const actualPort = server.address().port;
  return {
    url: `http://${host}:${actualPort}`,
    port: actualPort,
    root: absRoot,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

// CLI mode.
// pathToFileURL, not `file://${argv[1]}` — the repo path contains a space
// ("FrontEnd 2027"), which import.meta.url percent-encodes as %20. The naive
// comparison silently fails and the server exits 0 without listening.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const get = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
  };
  const srv = await startServer({ root: get('--root', '.'), port: Number(get('--port', 5173)) });
  console.log(`Serving ${srv.root}\n  ${srv.url}\nCtrl-C to stop.`);
}
