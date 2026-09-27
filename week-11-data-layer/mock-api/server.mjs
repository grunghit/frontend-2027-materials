#!/usr/bin/env node
/**
 * A tiny API that lives on your own machine, so the lab's network cannot take the
 * lesson with it.
 *
 *     node server.mjs            # http://127.0.0.1:5510
 *     node server.mjs --port 6000
 *
 * ── WHAT IT IS FOR, AND IT IS TWO THINGS
 *
 * 1. THE LAB WIFI. If `he.wikipedia.org` (or whatever you chose) is unreachable from
 *    the room, point `ENDPOINT` at this instead and carry on. The response shape is
 *    the same as the one in `data/catalogue.json`, so nothing else in your code has
 *    to change.
 *
 * 2. FAILURES YOU CANNOT GET FROM A REAL SERVER ON DEMAND. A real API will not return
 *    a 500 because you asked it to, and it will not hang for thirty seconds on cue.
 *    This one will, and that is the whole reason you can test the error path at all:
 *
 *      /search?q=קמח                 a normal answer
 *      /search?q=קמח&fail=404        a 404, with a valid JSON error document
 *      /search?q=קמח&fail=500        a 500
 *      /search?q=קמח&fail=html       a 200 whose body is an HTML login page
 *      /search?q=קמח&fail=truncated  a 200 whose body is not valid JSON
 *      /search?q=קמח&delay=8000      a normal answer, eight seconds late
 *      /search?q=קמח&delay=0&hang=1  never answers at all
 *      /search?q=זזזז                 a real empty result
 *
 * ── IT SENDS THE CORS HEADER, AND THAT IS WORTH LOOKING AT
 *
 * `access-control-allow-origin: *`, one line below. That one line is the entire
 * difference between an API a browser will let you read and one it will not — and the
 * server does not know or care who is asking. Comment it out, reload your page, and
 * you get exactly the failure Wikipedia's API gives you without `origin=*`: the request leaves, the server
 * answers, and your JavaScript is handed a `TypeError`.
 *
 * ── WHY IT IS NOT PART OF THE ASSIGNMENT
 *
 * Because a mock that always works teaches you nothing about a network that does not.
 * Use the real API for the assignment; use this when the real one is unavailable, and
 * when you want to see a 500 without waiting for somebody else's outage.
 *
 * Node 20+. No dependencies, deliberately: it has to run on a lab machine with no
 * `npm install` and no internet.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const portArg = argv.indexOf('--port');
const PORT = portArg === -1 ? 5510 : Number(argv[portArg + 1]);

/**
 * The catalogue this server searches: the SAME recorded response the assignment ships
 * with, not a second copy of it. Three places are tried, because this file is run from
 * three different layouts — the course repository, the published student folder, and a
 * ZIP somebody unpacked on their own. If none of them is there it falls back to six
 * rows written below, so the server always starts.
 */
async function loadCatalogue() {
  for (const candidate of [
    /* published: mock-api/ sits beside starter/ */
    path.join(HERE, '..', 'starter', 'data', 'catalogue.json'),
    /* this repository: lab/mock-api/ */
    path.join(HERE, '..', '..', 'class-assignment', 'starter', 'data', 'catalogue.json'),
    /* somebody dropped a copy next to the server */
    path.join(HERE, 'catalogue.json'),
  ]) {
    try {
      return JSON.parse(await readFile(candidate, 'utf8'));
    } catch {
      /* try the next one */
    }
  }
  return {
    batchcomplete: '',
    query: {
      pages: Object.fromEntries(
        ['קמח', 'סוכר', 'מלח', 'שמן זית', 'פפריקה', 'כמון'].map((title, i) => [
          String(i + 1),
          { pageid: i + 1, index: i + 1, title, extract: `${title}. שורה מקומית לבדיקה.` },
        ]),
      ),
    },
  };
}

const CATALOGUE = await loadCatalogue();
const ALL = Object.values(CATALOGUE.query?.pages ?? {});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  /*
   * THE ONE LINE. Comment it out to reproduce a CORS refusal on purpose — the request
   * still arrives here, this server still answers, and the page still cannot read it.
   */
  res.setHeader('access-control-allow-origin', '*');

  /* A preflight. Only sent for requests that are not "simple" — a custom header, or a
     PUT/DELETE. A plain GET search never triggers one, which is why most of this
     course never sees it. */
  if (req.method === 'OPTIONS') {
    res.setHeader('access-control-allow-headers', 'content-type');
    res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
    res.writeHead(204).end();
    return;
  }

  if (url.pathname !== '/search') {
    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: { code: 'notfound', info: `no route for ${url.pathname}` } }));
    return;
  }

  const query = (url.searchParams.get('q') ?? '').trim();
  const fail = url.searchParams.get('fail');
  const delay = Number(url.searchParams.get('delay') ?? 0);
  const hang = url.searchParams.get('hang') === '1';

  if (hang) {
    /* Never answers, never closes. This is a captive-portal wifi, and it is what a
       request with no timeout waits for — for ever. */
    console.log(`  ${url.search}  → hanging on purpose, and never answering`);
    return;
  }

  if (delay > 0) await sleep(delay);

  const send = (status, contentType, body) => {
    console.log(`  ${url.search}  → ${status}`);
    res.writeHead(status, { 'content-type': contentType });
    res.end(body);
  };

  if (fail === '404') {
    return send(
      404,
      'application/json; charset=utf-8',
      JSON.stringify({ error: { code: 'notfound', info: 'nothing here' } }),
    );
  }
  if (fail === '500') {
    return send(
      500,
      'application/json; charset=utf-8',
      JSON.stringify({ error: 'internal', requestId: 'a91f' }),
    );
  }
  if (fail === 'html') {
    /* A 200 whose body is not JSON. `res.ok` is TRUE here, and the failure arrives one
       line later, inside `res.json()`. */
    return send(200, 'text/html; charset=utf-8', '<!doctype html><h1>Sign in to continue</h1>');
  }
  if (fail === 'truncated') {
    return send(200, 'application/json; charset=utf-8', '{"batchcomplete":"","query":{"pag');
  }

  const matched = ALL.filter(
    (page) => query === '' || page.title.includes(query) || (page.extract ?? '').includes(query),
  ).slice(0, 6);

  /*
   * THE EMPTY ANSWER HAS THE SHAPE THE REAL ENDPOINT USES, and that is the point of
   * copying it: when nothing matched, MediaWiki leaves the `query` key out entirely
   * rather than sending an empty list. An application that handles this server's empty
   * answer handles the real one.
   */
  const body =
    matched.length === 0
      ? { batchcomplete: '' }
      : {
          batchcomplete: '',
          query: {
            pages: Object.fromEntries(
              matched.map((page, i) => [String(page.pageid ?? i + 1), { ...page, index: i + 1 }]),
            ),
          },
        };

  send(200, 'application/json; charset=utf-8', JSON.stringify(body));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`
  mock API listening on http://127.0.0.1:${PORT}
  ${ALL.length} rows in the catalogue.

  try these in the address bar:
    http://127.0.0.1:${PORT}/search?q=%D7%A7%D7%9E%D7%97
    http://127.0.0.1:${PORT}/search?q=%D7%A7%D7%9E%D7%97&fail=500
    http://127.0.0.1:${PORT}/search?q=%D7%A7%D7%9E%D7%97&delay=8000

  stop it with Ctrl-C.
`);
});
