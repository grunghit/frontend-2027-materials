/**
 * .checks/public-checks.mjs — home assignment 4. CORE-TIER functional checks only.
 *
 * RULES, because this file ships to student repositories:
 *   · CORE tier only. The stretch and challenge tiers stay in the private spec.
 *   · No point values. No grading criteria. `expected` is a hint, never the answer.
 *   · PAIR EVERY NEGATIVE CHECK WITH A POSITIVE ONE.
 *   · DO NOT RE-CHECK WHAT THE RUNNER ALREADY CHECKS — required files, HTML validity,
 *     `node --check`, console cleanliness on the ENTRY page, and no horizontal scroll.
 *
 * ── THE TRAP
 *
 *     AN APPLICATION THAT NEVER FETCHES AND NEVER WRITES PASSES EVERY TEST ABOUT WHAT
 *     HAPPENS WHEN A FETCH FAILS OR A WRITE IS CORRUPT.
 *
 * The starter boots to six `idle` rows with a clean console and zero requests — which
 * is the CORRECT state for an empty cache. So every robustness check below starts by
 * driving a real reading onto the screen through the submission's own two layers, and
 * only then breaks something.
 *
 * Verified by `npm run audit:ci`: 0 green on the starter, all green on the solution.
 *
 * The page arrives loaded at `index.html`, 1280x900, over http.
 */

const CITY_IDS = ['jerusalem', 'tel-aviv', 'haifa', 'beer-sheva', 'eilat', 'netanya'];

const reading = (t) =>
  JSON.stringify({
    latitude: 32.1,
    longitude: 34.8,
    current: { time: '2026-08-19T18:45', temperature_2m: t, wind_speed_10m: 12.3, weather_code: 1 },
  });

const board = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('#cities li[data-city]')].map((li) => ({
      id: li.dataset.city,
      state: li.dataset.state ?? null,
      temp: li.querySelector('.city-temp')?.textContent.trim() ?? null,
      age: li.querySelector('.city-age')?.textContent.trim() ?? null,
      error: li.querySelector('.city-error')?.textContent.trim() ?? null,
    })),
  );

async function intercept(page, ctx, respond) {
  const requests = [];
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.startsWith(ctx.serverUrl)) return route.continue();
    requests.push(url);
    return respond(route, { n: requests.length });
  });
  return { requests, errors, unroute: () => page.unroute('**/*').catch(() => {}) };
}

const okReading = (t) => (route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: reading(t) });

const refresh = (page, cityId) =>
  page.evaluate(async (id) => {
    const row = document.querySelector(`#cities li[data-city="${id}"]`);
    const button = row?.querySelector('button.refresh');
    const target = button?.querySelector('*') ?? button;
    if (!target) return false;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 400));
    return true;
  }, cityId);

async function waitForRow(page, cityId, wanted, timeoutMs = 10000) {
  const until = Date.now() + timeoutMs;
  let seen = null;
  while (Date.now() < until) {
    seen = await page
      .evaluate(
        (id) => document.querySelector(`#cities li[data-city="${id}"]`)?.dataset.state ?? null,
        cityId,
      )
      .catch(() => null);
    if (wanted.includes(seen)) return seen;
    await page.waitForTimeout(120);
  }
  return seen;
}

/** HALF ONE: a real reading, through the submission's own layers, onto the screen. */
async function provesItWorks(page, ctx, cityId = 'haifa', temperature = 27.7) {
  const net = await intercept(page, ctx, okReading(temperature));
  await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  if ((await board(page)).length !== CITY_IDS.length) return { ok: false, net };
  if (!(await refresh(page, cityId))) return { ok: false, net };
  const state = await waitForRow(page, cityId, ['fresh', 'stale', 'error']);
  const row = (await board(page)).find((r) => r.id === cityId);
  return { ok: state === 'fresh' && row?.temp !== null && net.requests.length > 0, net, row };
}

export const publicChecks = [
  {
    /*
     * PAIRED, and it had to be. An application that has never fetched anything genuinely
     * makes no request on load and genuinely draws six empty rows — which is the CORRECT
     * state for an empty cache, and is exactly the untouched starter. `npm run audit:ci`
     * caught it scoring green there. The second half is what makes it a check.
     */
    title: 'בטעינה לא נשלחת אף בקשה — ובכל זאת היישום יודע לשלוח אחת',
    expected:
      'ציור ראשון שמחכה לשש בקשות הוא מלבן לבן על חיבור גרוע. קודם נמדד שאפס בקשות בטעינה, ואז שרענון מפורש כן מגיע לרשת ומחזיר מדידה.',
    run: async (page, ctx) => {
      const net = await intercept(page, ctx, (route) => route.abort('failed'));
      await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      const rows = await board(page);
      const onLoad = net.requests.length;
      const crashed = net.errors.length;
      await net.unroute();
      if (onLoad !== 0 || rows.length !== CITY_IDS.length || crashed !== 0) return false;

      /* HALF TWO — it CAN ask, when asked. */
      const second = await provesItWorks(page, ctx);
      await second.net.unroute();
      return second.ok;
    },
  },

  {
    title: 'רענון עיר אחת מביא מדידה למסך',
    expected:
      'לחיצה על `button.refresh` שולחת בקשה, והתשובה מגיעה כ-`data-state="fresh"` עם טמפרטורה ב-`.city-temp`.',
    run: async (page, ctx) => {
      const first = await provesItWorks(page, ctx);
      await first.net.unroute();
      return first.ok;
    },
  },

  {
    title: 'המדידה שורדת רענון של העמוד — בלי בקשה חדשה',
    expected:
      'זו כל הטענה של מטמון. הבדיקה מפילה כל בקשה אחרי הרענון, ולכן שורה שמופיעה בכל זאת יכולה להגיע רק מהדיסק.',
    run: async (page, ctx) => {
      const first = await provesItWorks(page, ctx);
      await first.net.unroute();
      if (!first.ok) return false;

      const net = await intercept(page, ctx, (route) => route.abort('failed'));
      await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const row = (await board(page)).find((r) => r.id === 'haifa');
      const count = net.requests.length;
      await net.unroute();
      return count === 0 && row?.state === 'fresh' && row.temp !== null;
    },
  },

  {
    title: '`freshness` היא פונקציה טהורה, והיא נכונה',
    expected:
      'הבדיקה מייבאת את `js/cache.js` מתוך העמוד ומריצה `freshness(entry, now)` עם שעונים שהיא בחרה. `now` חייב להיות פרמטר — קריאה ל-Date.now() בפנים הופכת אותה לבלתי בדיקה.',
    run: async (page, ctx) => {
      await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
      const result = await page.evaluate(async () => {
        let mod;
        try {
          mod = await import('./js/cache.js');
        } catch {
          return null;
        }
        if (typeof mod.freshness !== 'function' || !Number.isFinite(mod.TTL_MS)) return null;
        const T = mod.TTL_MS;
        const now = 1_000_000_000;
        const at = (o) => ({ fetchedAt: now - o, temperature: 20, wind: 5, code: 1 });
        return {
          fresh: mod.freshness(at(0), now).status,
          nearly: mod.freshness(at(T - 1000), now).status,
          stale: mod.freshness(at(T + 1000), now).status,
          absent: mod.freshness(undefined, now).status,
          noStamp: mod.freshness({ temperature: 20 }, now).status,
          future: mod.freshness(at(-60000), now),
        };
      });
      if (result === null) return false;
      return (
        result.fresh === 'fresh' &&
        result.nearly === 'fresh' &&
        result.stale === 'stale' &&
        result.absent === 'absent' &&
        result.noStamp === 'absent' &&
        result.future.status === 'fresh' &&
        Number.isFinite(result.future.ageMs) &&
        result.future.ageMs >= 0
      );
    },
  },

  {
    title: '404 ו-500 הם שגיאה, ולא מדידה ולא קריסה',
    expected: '`fetch` לא זורק עליהם — ההבטחה מתקיימת ו-`res.ok` הוא false.',
    run: async (page, ctx) => {
      const first = await provesItWorks(page, ctx);
      await first.net.unroute();
      if (!first.ok) return false;

      for (const reply of [
        { status: 404, contentType: 'application/json', body: '{"error":"nope"}' },
        { status: 500, contentType: 'application/json', body: '{"reason":"boom"}' },
      ]) {
        const net = await intercept(page, ctx, (route) => route.fulfill(reply));
        await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);
        await refresh(page, 'eilat');
        const state = await waitForRow(page, 'eilat', ['error', 'fresh', 'stale']);
        const crashed = net.errors.length;
        await net.unroute();
        if (crashed > 0 || state !== 'error') return false;
      }
      return true;
    },
  },

  {
    title: 'זבל במפתח לא מפיל את העמוד — והעמוד באמת קורא אותו',
    expected:
      'קודם מוכח שמדידה אמיתית נכתבת ונקראת, ורק אז מושחת אותו מפתח בדיוק. `JSON.parse` שהצליח לא אומר כלום על המבנה.',
    run: async (page, ctx) => {
      const first = await provesItWorks(page, ctx);
      await first.net.unroute();
      if (!first.ok) return false;

      const keys = await page.evaluate(() => {
        const out = [];
        try {
          for (let i = 0; i < localStorage.length; i += 1) out.push(localStorage.key(i));
        } catch {
          /* blocked */
        }
        return out;
      });
      if (keys.length === 0) return false;

      for (const junk of [
        '{{{ not json',
        'null',
        '{"entries":"שלום"}',
        '[1,2,3]',
        '{"v":9999,"entries":{}}',
      ]) {
        const net = await intercept(page, ctx, (route) => route.abort('failed'));
        await page.evaluate(
          ({ key, junk }) => {
            try {
              localStorage.setItem(key, junk);
            } catch {
              /* blocked */
            }
          },
          { key: keys[0], junk },
        );
        await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(300);
        const rows = await board(page);
        const crashed = net.errors.length;
        await net.unroute();
        if (crashed > 0 || rows.length !== CITY_IDS.length) return false;
      }
      return true;
    },
  },

  {
    title: 'מצב שגיאה מציג את המדידה השמורה ואומר שהיא לא מעודכנת',
    expected:
      '"לא הצלחנו להגיע לשירות, וזה מה שהוא אמר לפני אחת עשרה דקות" שימושי הרבה יותר מכרטיס ריק — כל עוד שני החצאים נאמרים.',
    run: async (page, ctx) => {
      const first = await provesItWorks(page, ctx);
      await first.net.unroute();
      if (!first.ok) return false;

      const net = await intercept(page, ctx, (route) => route.abort('failed'));
      await page.goto(`${ctx.serverUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(250);
      await refresh(page, 'haifa');
      const state = await waitForRow(page, 'haifa', ['error']);
      const row = (await board(page)).find((r) => r.id === 'haifa');
      await net.unroute();
      return (
        state === 'error' &&
        row?.temp !== null &&
        row?.error !== null &&
        row.error.length >= 10 &&
        row?.age !== null
      );
    },
  },

  {
    /*
     * The source rules, PAIRED with the fact that the two layers work. "There is no
     * fetch in cache.js" is free on every submission that has not started.
     */
    title: 'השכבות נקיות — אין רשת ב-`cache.js`, אין אחסון ב-`api.js`, ואין DOM בשניהם',
    expected: 'שתי שכבות הגבול לא מכירות זו את זו, ואת שתיהן מחבר רק `js/app.js`.',
    run: async (page, ctx) => {
      const first = await provesItWorks(page, ctx);
      await first.net.unroute();
      if (!first.ok) return false;

      const read = async (relative) => {
        const res = await page.request.get(`${ctx.serverUrl}/${relative}`).catch(() => null);
        return res && res.ok() ? res.text() : null;
      };
      const strip = (t) =>
        t
          .replace(/\/\*[\s\S]*?\*\//g, ' ')
          .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
          .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
          .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
          .replace(/`(?:[^`\\]|\\.)*`/g, '``');

      const [cache, api] = await Promise.all([read('js/cache.js'), read('js/api.js')]);
      if (cache === null || api === null) return false;
      if (/\bfetch\s*\(|\bdocument\b|\bvar\s/.test(strip(cache))) return false;
      if (/localStorage|\bdocument\b|\bvar\s/.test(strip(api))) return false;
      return true;
    },
  },
];
