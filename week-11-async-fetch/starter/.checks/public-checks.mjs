/**
 * .checks/public-checks.mjs — week 11. CORE-TIER functional checks, and nothing else.
 *
 * RULES, because this file ships to student repositories:
 *   · CORE tier only (parts א, ב and ג). Parts ד and ה stay in the private spec.
 *   · No point values. No grading criteria. `expected` is a hint, never the answer.
 *   · PAIR EVERY NEGATIVE CHECK WITH A POSITIVE ONE.
 *   · DO NOT RE-CHECK WHAT THE RUNNER ALREADY CHECKS — required files, HTML validity,
 *     `node --check`, console cleanliness on the ENTRY page, and no horizontal scroll.
 *
 * ── THE WEEK-11 TRAP, AND IT IS WEEK 10'S IN A DIFFERENT COAT
 *
 * Week 10's was: an application that never READS localStorage passes every test about
 * what happens when localStorage contains rubbish. This week:
 *
 *     AN APPLICATION THAT NEVER MAKES A REQUEST PASSES EVERY TEST ABOUT WHAT HAPPENS
 *     WHEN A REQUEST FAILS.
 *
 * "It does not crash on a 500", "a 404 is not shown as results", "typing is not one
 * request per character" — all three are completely true of the untouched starter, which
 * asks nobody anything. So every check below is written in two halves:
 *
 *   1. intercept the page's cross-origin request, answer it with the bytes of the
 *      submission's OWN `data/catalogue.json`, and require `data-state="results"`,
 *   2. and ONLY THEN break the same request.
 *
 * ── HOW THIS FILE CHECKS AN API IT HAS NEVER HEARD OF
 *
 * It never names a host and never assumes a response shape. Everything cross-origin is
 * captured — so "the API" is whatever the page asked for — and the success body is the
 * page's own recorded response, which the brief requires to be a real one from its own
 * endpoint. The one thing that is fixed is `#api-panel[data-state]`, which is why the
 * brief fixes it.
 *
 * Verified by `npm run audit:ci`: 0 green on the starter, all green on the solution.
 *
 * The page arrives loaded at `index.html`, 1280x900, over http.
 */

/** Reload the entry page. Every check starts here — the runner shares one page. */
const fresh = async (page, ctx) => {
  await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(120);
};

/** What the search panel says about itself right now. */
const panelState = (page) =>
  page.evaluate(() => {
    const visible = (selector) => {
      const el = document.querySelector(selector);
      return el === null ? null : !el.hidden && el.offsetParent !== null;
    };
    return {
      state: document.querySelector('#api-panel')?.dataset.state ?? null,
      rows: [...document.querySelectorAll('#api-results li')].map(
        (li) => li.dataset.title ?? li.textContent.trim().slice(0, 40),
      ),
      idle: visible('#api-idle'),
      loading: visible('#api-loading'),
      empty: visible('#api-empty'),
      error: visible('#api-error'),
      errorText: (document.querySelector('#api-error-text')?.textContent ?? '').trim(),
      offers: ['#api-retry', '#api-offline'].filter((s) => visible(s) === true).length,
      items: [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent.trim()),
    };
  });

/** Type into the search box the way a person does. */
async function typeQuery(page, text, delay = 40) {
  const box = page.locator('#api-query');
  if ((await box.count()) === 0) return false;
  await box.click();
  await box.fill('');
  await box.pressSequentially(text, { delay });
  return true;
}

/**
 * Put a router in front of every cross-origin request and hand back the page's own
 * recorded response, so a check can answer an endpoint it has never heard of.
 */
async function intercept(page, ctx, respond) {
  const requests = [];
  const failures = [];
  const errors = [];
  page.on('requestfailed', (r) => failures.push(r.failure()?.errorText ?? '?'));
  page.on('pageerror', (e) => errors.push(e.message));

  let bytes = null;
  const res = await page.request.get(`${ctx.serverUrl}/data/catalogue.json`).catch(() => null);
  if (res !== null && res.ok()) bytes = await res.text();

  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.startsWith(ctx.serverUrl)) return route.continue();
    requests.push(url);
    return respond(route, { bytes, n: requests.length });
  });

  return {
    requests,
    failures,
    errors,
    bytes,
    unroute: () => page.unroute('**/*').catch(() => {}),
  };
}

const ok = (bytes) => (route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: bytes ?? '{}' });

/**
 * HALF ONE, and every check below starts with it: the page asks, and what comes back
 * reaches the screen.
 */
async function provesItAsks(page, ctx) {
  const net = await intercept(page, ctx, (route, { bytes }) => ok(bytes)(route));
  if (net.bytes === null) return { ok: false, net };
  await fresh(page, ctx);
  if (!(await typeQuery(page, 'קמח'))) return { ok: false, net };
  await page.waitForTimeout(1400);
  const view = await panelState(page);
  return {
    ok: net.requests.length > 0 && view.state === 'results' && view.rows.length > 0,
    net,
    view,
  };
}

/** Fetch a source file that sits beside the page. */
const sourceOf = async (page, relative) => {
  const res = await page.request.get(new URL(relative, page.url()).href).catch(() => null);
  if (!res || !res.ok()) return null;
  return res.text();
};

/** Strip comments and string literals, so a rule is never matched inside prose. */
const code = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');

export const publicChecks = [
  {
    /*
     * THE ROW THE WEEK EXISTS FOR. The answer replayed here is the page's OWN recorded
     * response, so this works whatever API you chose and whatever shape it returns.
     */
    title: 'חיפוש מוצלח מגיע למסך',
    expected:
      'הקלדה בתיבה שולחת בקשה, והתשובה מגיעה כ-`data-state="results"` עם שורות ב-`#api-results`. הבדיקה עונה לבקשה שלך בתוכן של `data/catalogue.json` שלך עצמך.',
    run: async (page, ctx) => {
      const first = await provesItAsks(page, ctx);
      await first.net.unroute();
      return first.ok;
    },
  },

  {
    title: '404 עם גוף JSON תקין הוא שגיאה, ולא תוצאות ולא קריסה',
    expected:
      '`fetch` לא זורק על 404 — ההבטחה מתקיימת ו-`res.ok` הוא false. מי שלא בדק יפרסר את מסמך השגיאה.',
    run: async (page, ctx) => {
      const first = await provesItAsks(page, ctx);
      await first.net.unroute();
      if (!first.ok) return false;

      const net = await intercept(page, ctx, (route) =>
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: '{"error":{"code":"notfound"}}',
        }),
      );
      await fresh(page, ctx);
      await typeQuery(page, 'סוכר');
      await page.waitForTimeout(1600);
      const view = await panelState(page);
      await net.unroute();
      return view.state === 'error' && net.errors.length === 0;
    },
  },

  {
    title: 'גם 500, וגם 200 שהגוף שלו אינו JSON',
    expected:
      'שני מטענים. השני הוא מה שרשת Wi-Fi עם עמוד התחברות מחזירה: 200 עם HTML, שנכשל ב-`res.json()` ולא לפניו.',
    run: async (page, ctx) => {
      const first = await provesItAsks(page, ctx);
      await first.net.unroute();
      if (!first.ok) return false;

      for (const reply of [
        { status: 500, contentType: 'application/json', body: '{"error":"boom"}' },
        { status: 200, contentType: 'text/html', body: '<!doctype html><h1>Sign in</h1>' },
      ]) {
        const net = await intercept(page, ctx, (route) => route.fulfill(reply));
        await fresh(page, ctx);
        await typeQuery(page, 'מלח');
        await page.waitForTimeout(1600);
        const view = await panelState(page);
        const crashed = net.errors.length > 0;
        await net.unroute();
        if (crashed || view.state !== 'error') return false;
      }
      return true;
    },
  },

  {
    title: 'מצב הטעינה נראה בזמן שהבקשה פתוחה, ואחד בכל רגע',
    expected:
      'הבדיקה מעכבת את התשובה ומצלמת באמצע. מצב טעינה שנכתב **אחרי** ה-await לא קיים בזמן ההמתנה — הוא קיים אחריה.',
    run: async (page, ctx) => {
      const first = await provesItAsks(page, ctx);
      await first.net.unroute();
      if (!first.ok) return false;

      const net = await intercept(page, ctx, async (route, { bytes }) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return ok(bytes)(route);
      });
      await fresh(page, ctx);
      await typeQuery(page, 'דבש');
      await page.waitForTimeout(700);
      const during = await panelState(page);
      await page.waitForTimeout(1800);
      const after = await panelState(page);
      await net.unroute();

      const shownDuring = [during.idle, during.loading, during.empty, during.error].filter(
        Boolean,
      ).length;
      return (
        during.state === 'loading' &&
        shownDuring === 1 &&
        during.loading === true &&
        after.state === 'results'
      );
    },
  },

  {
    title: 'חיפוש שהצליח ולא מצא כלום הוא `empty`, ולפני שחיפשו משהו זה `idle`',
    expected:
      'שני מצבים שונים לגמרי. "לא נמצא כלום" בטעינה הוא שקר — אף אחד עוד לא חיפש. והבדיקה גם מוודאת שתשובה ריקה לא מגיעה כשגיאה.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const boot = await panelState(page);
      if (boot.state !== 'idle') return false;

      const first = await provesItAsks(page, ctx);
      const bytes = first.net.bytes;
      await first.net.unroute();
      if (!first.ok) return false;

      /* Two ways to say "nothing matched", and either one counts: some endpoints send
         an empty results key, others leave it out entirely. */
      const emptied = JSON.stringify(JSON.parse(bytes), (key, value) =>
        Array.isArray(value) ? [] : value,
      );
      for (const body of [emptied, '{}']) {
        const net = await intercept(page, ctx, (route) =>
          route.fulfill({ status: 200, contentType: 'application/json', body }),
        );
        await fresh(page, ctx);
        await typeQuery(page, 'עדשים');
        await page.waitForTimeout(1600);
        const view = await panelState(page);
        const crashed = net.errors.length > 0;
        await net.unroute();
        if (!crashed && view.state === 'empty') return true;
      }
      return false;
    },
  },

  {
    title: 'כשאין רשת, מצב השגיאה אומר משפט ומציע את הקטלוג המקומי — והוא עובד',
    expected:
      'הבדיקה מפילה כל בקשה החוצה ולוחצת על ההצעה. `data/catalogue.json` מוגש מאותו שרת כמו העמוד ולכן לא מיורט — בדיוק כמו במעבדה בלי אינטרנט.',
    run: async (page, ctx) => {
      const net = await intercept(page, ctx, (route) => route.abort('failed'));
      await fresh(page, ctx);
      if (!(await typeQuery(page, 'קמח'))) {
        await net.unroute();
        return false;
      }
      await page.waitForTimeout(3000);
      const failed = await panelState(page);
      if (failed.state !== 'error' || failed.errorText.length < 15 || failed.offers < 1) {
        await net.unroute();
        return false;
      }

      const offer = page.locator('#api-offline');
      if ((await offer.count()) === 0 || (await offer.isHidden())) {
        await net.unroute();
        return false;
      }
      await offer.click();
      await page.waitForTimeout(1200);
      const local = await panelState(page);
      const crashed = net.errors.length > 0;
      await net.unroute();
      return local.state === 'results' && local.rows.length > 0 && !crashed;
    },
  },

  {
    /*
     * BOTH HALVES IN ONE CHECK, because each is free without the other: a suggestion
     * list that adds nothing passes the second, and an add that never persists passes
     * the first.
     */
    title: 'לחיצה על הצעה מוסיפה פריט לאוסף, והוא שם גם אחרי רענון',
    expected:
      'ואיש לא כתב שורת שמירה בשבילו: המטפל קורא ל-`setState`, וההרשמה משבוע 10 עושה את השאר.',
    run: async (page, ctx) => {
      const first = await provesItAsks(page, ctx);
      if (!first.ok) {
        await first.net.unroute();
        return false;
      }

      const before = await panelState(page);
      const clicked = await page.evaluate(async () => {
        const row = document.querySelector('#api-results li');
        const button = row?.querySelector('button.adopt');
        const target = button?.querySelector('*') ?? button;
        if (!target) return null;
        const title =
          row.dataset.title ?? row.querySelector('.suggestion-title')?.textContent.trim() ?? '';
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 250));
        return title;
      });
      await first.net.unroute();
      if (clicked === null || clicked === '') return false;

      const added = await panelState(page);
      if (added.items.length !== before.items.length + 1 || !added.items.includes(clicked)) {
        return false;
      }

      await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const after = await panelState(page);
      return after.items.includes(clicked) && after.items.length === before.items.length + 1;
    },
  },

  {
    title: 'הקלדת מילה אינה בקשה לכל תו',
    expected:
      'השהיה של כ-300 מילישניות אחרי ההקשה האחרונה. הבדיקה סופרת את הבקשות שיצאו בזמן הקלדה של שלוש עשרה תווים.',
    run: async (page, ctx) => {
      const first = await provesItAsks(page, ctx);
      await first.net.unroute();
      if (!first.ok) return false;

      const net = await intercept(page, ctx, (route, { bytes }) => ok(bytes)(route));
      await fresh(page, ctx);
      await typeQuery(page, 'פפריקה מעושנת', 45);
      await page.waitForTimeout(1400);
      const count = net.requests.length;
      await net.unroute();
      return count >= 1 && count <= 3;
    },
  },

  {
    /*
     * The source rules, PAIRED with the fact that the search works. "There is no fetch
     * in render.js" is free on every submission that has not started, and so is "there
     * is no document in api.js" on a file that is still a skeleton.
     */
    title: 'השכבות נקיות — הרשת לא נוגעת ב-DOM, והציור והאירועים לא מכירים את `fetch`',
    expected:
      '`js/api.js` בלי `document` ובלי `setState`. `js/render.js` בלי `fetch`, בלי `async` ובלי כתובת. `js/events.js` בלי `fetch` ובלי כתובת.',
    run: async (page, ctx) => {
      const first = await provesItAsks(page, ctx);
      await first.net.unroute();
      if (!first.ok) return false;

      const [api, render, events] = await Promise.all([
        sourceOf(page, 'js/api.js'),
        sourceOf(page, 'js/render.js'),
        sourceOf(page, 'js/events.js'),
      ]);
      if (api === null || render === null || events === null) return false;

      if (/\bdocument\b|querySelector|\bsetState\b/.test(code(api))) return false;
      if (/\bfetch\s*\(|\bawait\b|\basync\b|https?:\/\//.test(code(render))) return false;
      if (/\bfetch\s*\(|https?:\/\//.test(code(events))) return false;
      return /\bsetState\b/.test(code(events));
    },
  },
];
