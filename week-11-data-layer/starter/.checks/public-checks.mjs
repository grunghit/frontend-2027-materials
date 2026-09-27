/**
 * .checks/public-checks.mjs — week 11, the data layer. CORE-TIER functional checks, and
 * nothing else.
 *
 * ONE FILE FOR THE MERGED WEEK. The old week-10 storage checks and the old week-11 fetch
 * checks became this set when the two class assignments became one (batch 06, §0.6 row
 * 11); the storage half was rewritten for the project's contract (P0 E1) — `<app>:v1`, a
 * bare JSON array, and an absent key is an EMPTY pantry — so nothing here relies on seed
 * data, envelopes or migration.
 *
 * RULES, because this file ships to student repositories:
^ *   · CORE tier only (parts א–ה of the brief). Parts ו and ז (debounce, abort, newest
 *     answer, the write budget, retry, clear-all) stay in the private spec.
 *   · No point values. No grading criteria. `expected` is a hint, never the answer.
 *   · PAIR EVERY NEGATIVE CHECK WITH A POSITIVE ONE.
 *   · DO NOT RE-CHECK WHAT THE RUNNER ALREADY CHECKS — required files, HTML validity,
 *     `node --check`, console cleanliness on the ENTRY page, and no horizontal scroll.
 *
 * ── THE TRAP, IN TWO COATS
 *
 *     AN APPLICATION THAT NEVER READS localStorage PASSES EVERY TEST ABOUT WHAT
 *     HAPPENS WHEN localStorage CONTAINS RUBBISH.
 *
 *     AN APPLICATION THAT NEVER MAKES A REQUEST PASSES EVERY TEST ABOUT WHAT HAPPENS
 *     WHEN A REQUEST FAILS.
 *
 * So every robustness check is two-halved, always in this order: prove the page reads
 * its own key (write back the string it wrote, reload, require the item on screen) or
 * asks and shows (answer its cross-origin request with the bytes of its own
 * `data/catalogue.json`, require `results`) — and ONLY THEN corrupt or break it.
 *
 * ── HOW THIS FILE CHECKS A KEY AND AN API IT HAS NEVER HEARD OF
 *
 * `capture()` adds one item through the form and diffs localStorage, so the key and the
 * string are the student's own. `intercept()` lets same-origin requests through and
 * captures everything else, so "the API" is whatever the page asked for, answered with
 * its own recorded response. What IS fixed, and fixed in the brief: the form and list
 * ids, and `#api-panel[data-state]`.
 *
 * A FIRST VISIT IS AN EMPTY PANTRY. Every check that needs rows adds them through the
 * form first (`ensureItems`); none relies on demo data, which arrives only from
 * `#reset-demo`.
 *
 * Verified by `npm run audit:ci`: 0 green on the starter, all green on the solution.
 *
 * The page arrives loaded at `index.html`, 1280x900, over http.
 */

/** The item this file adds. Distinctive, so it can be recognised inside a payload. */
const MARKER = 'מלפפון חמוץ';

/** The key shape the project and the exam read: a name, a colon, `v` and a number. */
const KEY_SHAPE = /.:v\d+$/;

/** Reload the entry page. Every check starts here — the runner shares one page. */
const fresh = async (page, ctx) => {
  await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(120);
};

/* ── The storage half ────────────────────────────────────────────────────────── */

/** What the list page says about itself right now. */
const listOf = (page) =>
  page.evaluate(() => ({
    titles: [...document.querySelectorAll('#list .item-title')].map((el) => el.textContent.trim()),
    numbers: [...document.querySelectorAll('#list .item-number')].map((el) =>
      el.textContent.trim(),
    ),
    ids: [...document.querySelectorAll('#list li')].map((li) => li.dataset.id ?? null),
    body: document.body.innerText.trim().length,
  }));

/** Add one item through the form. */
const addItem = (page, title, number, category) =>
  page.evaluate(
    async (a) => {
      const form = document.querySelector('#item-form');
      const fields = ['#field-title', '#field-number', '#field-category'].map((s) =>
        document.querySelector(s),
      );
      if (!form || fields.some((f) => !f)) return false;
      fields[0].value = a.title;
      fields[1].value = String(a.number);
      fields[2].value = a.category;
      form.requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 180));
      return true;
    },
    { title, number, category },
  );

/**
 * Make sure the list has at least `n` rows, adding them through the form. A first visit
 * is empty, so the checks that edit or remove something bring their own rows.
 */
async function ensureItems(page, ctx, n = 3) {
  await fresh(page, ctx);
  let state = await listOf(page);
  for (let i = state.titles.length; i < n; i += 1) {
    if (!(await addItem(page, `פריט בדיקה ${i + 1}`, i + 2, 'בדיקה'))) break;
  }
  state = await listOf(page);
  return state;
}

/** Click the innermost element of a row's button, which is what a real pointer hits. */
const clickRow = (page, buttonSelector) =>
  page.evaluate(async (selector) => {
    const row = document.querySelector('#list li');
    const button = row?.querySelector(selector);
    const target = button?.querySelector('*') ?? button;
    if (!target) return null;
    const out = {
      title: row.querySelector('.item-title')?.textContent.trim() ?? '',
      id: row.dataset.id ?? null,
    };
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 180));
    return out;
  }, buttonSelector);

/** Read the whole of this origin's localStorage, without ever throwing. */
const dump = (page) =>
  page.evaluate(() => {
    const out = {};
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        out[key] = localStorage.getItem(key);
      }
    } catch {
      /* blocked — an empty dump is the honest answer */
    }
    return out;
  });

/**
 * Add one item and diff localStorage. Returns the key the application chose and the
 * exact string it wrote, or null if it wrote nothing at all.
 *
 * POLLED, NOT READ ONCE: a save debounced by ~300ms with a flush on `pagehide` is a
 * correct answer, and a single read right after the add would find nothing.
 */
async function capture(page, ctx) {
  await fresh(page, ctx);
  const before = await dump(page);
  if (!(await addItem(page, MARKER, 7, 'בדיקה'))) return null;

  let after = await dump(page);
  let changed = Object.keys(after).filter((key) => after[key] !== before[key]);
  for (let waited = 0; changed.length === 0 && waited < 1200; waited += 150) {
    await page.waitForTimeout(150);
    after = await dump(page);
    changed = Object.keys(after).filter((key) => after[key] !== before[key]);
  }
  if (changed.length === 0) return null;

  const mentioning = changed.filter((key) => after[key].includes(MARKER));
  const key = (mentioning.length ? mentioning : changed)[0];
  return { key, raw: after[key] };
}

/** Put an exact string under an exact key (null removes it), reload, report the screen. */
async function bootWith(page, ctx, key, value) {
  const errors = [];
  const onError = (e) => errors.push(e.message);
  page.on('pageerror', onError);
  await page.evaluate(
    ({ key, value }) => {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        /* blocked */
      }
    },
    { key, value },
  );
  await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  const state = await listOf(page);
  page.off('pageerror', onError);
  return { ...state, errors };
}

/** Parse a payload without ever throwing. */
const parse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

/* ── The network half ────────────────────────────────────────────────────────── */

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
 * HALF ONE of every network check: the page asks, and what comes back reaches the
 * screen.
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

/** Wait until the panel reaches one of `wanted`, or give up. A fixed sleep grades speed. */
async function waitForState(page, wanted, timeoutMs = 12000) {
  const until = Date.now() + timeoutMs;
  let seen = null;
  while (Date.now() < until) {
    seen = await page
      .evaluate(() => document.querySelector('#api-panel')?.dataset.state ?? null)
      .catch(() => null);
    if (wanted.includes(seen)) return seen;
    await page.waitForTimeout(120);
  }
  return seen;
}

/* ── Source rules ────────────────────────────────────────────────────────────── */

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
  /* ── א · שכבת האחסון ─────────────────────────────────────────────────────── */
  {
    /*
     * The row the storage half exists for, and the only one that needs no pairing:
     * adding an item and reloading is a claim no un-persisted application passes.
     */
    title: 'פריט שנוסף שורד רענון של העמוד',
    expected:
      'הוספת פריט דרך הטופס, טעינה מחדש של העמוד, והפריט עדיין ברשימה. אם הוא נעלם — או שאף אחד לא כתב, או שאף אחד לא קרא.',
    run: async (page, ctx) => {
      await fresh(page, ctx);
      const before = await listOf(page);
      if (!(await addItem(page, MARKER, 7, 'בדיקה'))) return false;
      const added = await listOf(page);
      if (!added.titles.includes(MARKER)) return false;

      await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(220);
      const after = await listOf(page);
      return after.titles.includes(MARKER) && after.titles.length === before.titles.length + 1;
    },
  },

  {
    title: 'המפתח בצורה `<app>:v1`, והערך הוא מערך JSON',
    expected:
      'החוזה של הפרויקט ושל המבחן: שם, נקודתיים, `v` ומספר — והערך הוא האוסף עצמו, בלי שום דבר עטוף סביבו. הבדיקה לוקחת את המפתח שהיישום שלך כתב ולא מניחה אף שם.',
    run: async (page, ctx) => {
      const found = await capture(page, ctx);
      if (found === null) return false;
      return KEY_SHAPE.test(found.key) && Array.isArray(parse(found.raw));
    },
  },

  {
    /*
     * PAIRED. "Nothing on screen without the key" is free on an application that never
     * saves or reads anything, so half two writes the application's own string back
     * and requires the item.
     */
    title: 'מפתח שאינו קיים הוא אוסף ריק — ולא נתוני הדוגמה',
    expected:
      'שני חצאים: בלי המפתח העמוד עולה ריק (ביקור ראשון הוא מזווה ריק), ואז המחרוזת שהיישום עצמו כתב נכתבת בחזרה והפריט חוזר.',
    run: async (page, ctx) => {
      const found = await capture(page, ctx);
      if (found === null) return false;

      const absent = await bootWith(page, ctx, found.key, null);
      if (absent.errors.length > 0 || absent.titles.length !== 0) return false;

      const restored = await bootWith(page, ctx, found.key, found.raw);
      return restored.titles.includes(MARKER);
    },
  },

  {
    /*
     * The source rules, PAIRED with the fact that persistence works. "There is no
     * localStorage in render.js" is free on every application that has not started,
     * and so is "there is no document in storage.js" on a file that is still a skeleton.
     */
    title: 'השכבות נקיות — האחסון לא נוגע ב-DOM, והציור והאירועים לא יודעים ששומרים',
    expected:
      '`js/storage.js` בלי `document`. `js/render.js` ו-`js/events.js` בלי `localStorage` ובלי `JSON`, ובלי קריאה ל-save. כל שלושת הקבצים בשימוש בפועל.',
    run: async (page, ctx) => {
      const found = await capture(page, ctx);
      if (found === null) return false;
      const restored = await bootWith(page, ctx, found.key, found.raw);
      if (!restored.titles.includes(MARKER)) return false;

      const [storage, render, events] = await Promise.all([
        sourceOf(page, 'js/storage.js'),
        sourceOf(page, 'js/render.js'),
        sourceOf(page, 'js/events.js'),
      ]);
      if (storage === null || render === null || events === null) return false;

      const storageCode = code(storage);
      const renderCode = code(render);
      const eventsCode = code(events);

      if (/\bdocument\b|querySelector/.test(storageCode)) return false;
      if (/localStorage|sessionStorage|JSON\s*\./.test(renderCode)) return false;
      if (/localStorage|sessionStorage|JSON\s*\./.test(eventsCode)) return false;
      /* A handler that saves by hand works, and it is the habit this week removes. */
      if (/\b(save|persist)\s*\(/.test(eventsCode)) return false;
      return /\bsetState\b/.test(eventsCode);
    },
  },

  /* ── ב · CRUD שנשמר, ונתונים שאינם נתונים ────────────────────────────────── */
  {
    /*
     * The U of CRUD. Both halves in one check, because each is free without the other:
     * a form that fills itself and never saves passes the first, and a submit that
     * always adds passes the second while adding a row.
     */
    title: 'עריכה — הכפתור פותח את הפריט בטופס, והשמירה משנה אותו ולא מוסיפה חדש',
    expected:
      'הבדיקה מוסיפה שורות דרך הטופס ואז לוחצת `button.edit` בשורה הראשונה. הטופס מתמלא בערכי הפריט; שליחה מחליפה את הפריט הקיים — אותו `data-id`, אותה כמות שורות.',
    run: async (page, ctx) => {
      const before = await ensureItems(page, ctx, 3);
      if (before.titles.length < 2) return false;

      const target = await clickRow(page, 'button.edit');
      if (target === null) return false;

      const filled = await page.evaluate(() => document.querySelector('#field-title')?.value ?? '');
      if (filled !== target.title) return false;

      await page.evaluate(async () => {
        document.querySelector('#field-number').value = '42';
        document.querySelector('#item-form').requestSubmit();
        await new Promise((resolve) => setTimeout(resolve, 180));
      });

      const after = await listOf(page);
      const index = after.ids.indexOf(target.id);
      return (
        after.titles.length === before.titles.length &&
        index !== -1 &&
        after.numbers[index] === '42'
      );
    },
  },

  {
    title: 'עריכה והסרה שורדות רענון',
    expected:
      'ההסרה היא הפעולה שהכי קל לשכוח לשמור, כי על המסך היא נראית מיד. הבדיקה מוסיפה שורות בטופס, עורכת אחת, מסירה אחרת, וטוענת מחדש.',
    run: async (page, ctx) => {
      const before = await ensureItems(page, ctx, 3);
      if (before.titles.length < 2) return false;

      const edited = await clickRow(page, 'button.edit');
      if (edited === null) return false;
      await page.evaluate(async () => {
        document.querySelector('#field-number').value = '77';
        document.querySelector('#item-form').requestSubmit();
        await new Promise((resolve) => setTimeout(resolve, 180));
      });

      /* Remove a DIFFERENT row, and follow it by id: the list may re-sort after the
         edit, and titles repeat once earlier checks have added the same item twice. */
      const removed = await page.evaluate(async (editedId) => {
        const rows = [...document.querySelectorAll('#list li')].filter(
          (li) => li.dataset.id !== editedId,
        );
        const row = rows[rows.length - 1];
        const button = row?.querySelector('button.remove');
        const target = button?.querySelector('*') ?? button;
        if (!target) return null;
        const id = row.dataset.id ?? null;
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 180));
        return id;
      }, edited.id);
      if (removed === null) return false;

      await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(220);
      const after = await listOf(page);
      const index = after.ids.indexOf(edited.id);
      return (
        index !== -1 &&
        after.numbers[index] === '77' &&
        !after.ids.includes(removed) &&
        after.titles.length === before.titles.length - 1
      );
    },
  },

  {
    /*
     * PAIRED, and this is the pairing the storage half turns on. Half one proves the
     * key is read at all — without it, an application that has never opened
     * localStorage passes "survives garbage" perfectly.
     */
    title: 'זבל במפתח לא מפיל את היישום — והיישום באמת קורא את המפתח',
    expected:
      'כתיבה חזרה של המחרוזת שהיישום עצמו ייצר מחזירה את הפריט; ואז מחרוזת פגומה באותו מפתח, והעמוד עדיין עולה ומצייר.',
    run: async (page, ctx) => {
      const found = await capture(page, ctx);
      if (found === null) return false;

      const restored = await bootWith(page, ctx, found.key, found.raw);
      if (!restored.titles.includes(MARKER)) return false;

      const garbage = await bootWith(page, ctx, found.key, '{{{ not json at all');
      return garbage.errors.length === 0 && garbage.body > 0;
    },
  },

  {
    title: 'JSON תקין שאינו מערך לא מפיל, ושורה פגומה במערך מאבדת רק את עצמה',
    expected:
      '`JSON.parse` שהצליח אומר שהמחרוזת תקינה — לא שהיא אוסף. הבדיקה מנסה שני ערכים תקינים שאינם מערך, ואז את הפריט שהיישום שלך עצמו כתב לצד שורה שאינה פריט, ודורשת שהפריט יוצג.',
    run: async (page, ctx) => {
      const found = await capture(page, ctx);
      if (found === null) return false;

      const parsed = parse(found.raw);
      if (!Array.isArray(parsed)) return false;
      const mine = parsed.find((row) => JSON.stringify(row).includes(MARKER));
      if (mine === undefined) return false;

      for (const payload of ['null', '{"not":"an array"}']) {
        const boot = await bootWith(page, ctx, found.key, payload);
        if (boot.errors.length > 0 || boot.body === 0) return false;
      }
      const mixed = await bootWith(page, ctx, found.key, JSON.stringify([mine, { junk: true }]));
      return mixed.errors.length === 0 && mixed.titles.includes(MARKER);
    },
  },

  /* ── ג · שכבת הרשת ───────────────────────────────────────────────────────── */
  {
    /*
     * The row the network half exists for. The answer replayed here is the page's OWN
     * recorded response, so this works whatever API you chose and whatever it returns.
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

  /* ── ד · חמשת המצבים והנתיב הלא-מקוון ────────────────────────────────────── */
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
      await waitForState(page, ['results', 'empty', 'error']);
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
      await waitForState(page, ['error']);
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

  /* ── ה · מהקטלוג אל האוסף ────────────────────────────────────────────────── */
  {
    /*
     * BOTH HALVES IN ONE CHECK, because each is free without the other: a suggestion
     * list that adds nothing passes the second, and an add that never persists passes
     * the first.
     */
    title: 'לחיצה על הצעה מוסיפה פריט לאוסף, והוא שם גם אחרי רענון',
    expected:
      'ואיש לא כתב שורת שמירה בשבילו: המטפל קורא ל-`setState`, וההרשמה של `persist` ב-`js/app.js` עושה את השאר.',
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
];
