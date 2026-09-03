/*
 * ============================================================================
 * app.js — state, render and events, wired to the two boundary layers.
 *
 * GIVEN, WITH FOUR GAPS. Everything structural is here — the state, the one door, the
 * component, the delegated listener, the boot. What is missing is the four places where
 * this file has to ASK the two layers something, and each of them is marked.
 *
 * READ THE WHOLE FILE BEFORE YOU WRITE ANYTHING. It is the shape of every application
 * you have built since week 9, and the four gaps are small precisely because the two
 * files beside it are doing the work.
 *
 * ── WHY THIS ONE IS NOT SPLIT INTO THREE FILES
 *
 * Because the assignment is about the two files that ARE split out. `cache.js` and
 * `api.js` are the boundaries, and the reason they are separate is not tidiness: they
 * are the only two places in this application that talk to anything outside it, and
 * both of them are testable without a browser as a result.
 *
 * The one-way loop is still here, all three laws intact:
 *   ONE TRUTH      if it is on screen it came from `state`
 *   ONE PAINTER    only `render()` writes to the screen
 *   ONE DIRECTION  handlers change state; nothing reads the screen to find out what is
 *                  true
 *
 * ── THE STATE, AND THE ONE THING THAT IS NOT IN IT
 *
 * `state.cache` is a copy of what is on disk, held in memory so `render` stays
 * synchronous. `state.status` is what is HAPPENING to each city — a request, or a
 * failure — and it is NEVER saved: a persisted "loading" is a page that boots with a
 * spinner it can never clear.
 *
 * WHAT IS NOT STORED IS FRESHNESS. It is derived, every render, from `fetchedAt` and
 * the clock — because a value that was fresh when you stored it is stale ten minutes
 * later and nothing will have told you. Store the derived answer and the screen is
 * wrong by exactly the amount of time the tab has been open.
 * ============================================================================
 */
import { CITIES, WEATHER_CODES } from './cities.js';
import { ApiError, fetchWeather } from './api.js';
import { clearCache, describeAge, freshness, readAll, writeOne } from './cache.js';

/* ── State ────────────────────────────────────────────────────────────────── */

const state = {
  /** cityId -> the reading on disk. Loaded once, at boot, and kept in step with it. */
  cache: readAll(),
  /** cityId -> 'loading' | { error: string } . Absent means "nothing is happening". */
  status: {},
  /** Set when a write to disk failed, so `render` can say a sentence about it. */
  storageError: null,
};

/** The one door. Everything that changes anything comes through here. */
function setState(patch) {
  Object.assign(state, patch);
  render();
}

/* ── Derivations ──────────────────────────────────────────────────────────── */

/**
 * Everything one row needs, computed from the two sources and the clock.
 *
 * THE FIVE VIEWS, exactly as week 11's search panel had them, and for the same reason:
 * five values in one field cannot contradict each other, and five booleans can.
 *
 *   'loading'  a request is open for this city
 *   'error'    the last attempt failed. There may STILL be a reading to show.
 *   'idle'     nothing cached, nothing tried
 *   'fresh'    cached, inside the TTL
 *   'stale'    cached, outside it
 */
function viewOf(cityId, now = Date.now()) {
  const status = state.status[cityId];
  const entry = state.cache[cityId];

  // CODE HERE (1 of 4) — ask `freshness` how old this entry is, then return one of the
  // five views. The order matters: 'loading' and 'error' are about what is HAPPENING and
  // beat anything about the data, and an error still carries its entry so the row can
  // show a stale reading beside the failure.
  return { view: 'idle', entry: undefined, ageMs: 0 };
}

/** What the header says: how much of the board is real, and how old the oldest is. */
function summarise(now = Date.now()) {
  const rows = CITIES.map((city) => viewOf(city.id, now));
  const withData = rows.filter((row) => row.entry !== undefined);
  const stale = rows.filter((row) => row.view === 'stale').length;
  const oldest = withData.length === 0 ? 0 : Math.max(...withData.map((row) => row.ageMs));
  return { cached: withData.length, total: CITIES.length, stale, oldest };
}

/* ── Render ───────────────────────────────────────────────────────────────── */

/**
 * Build ONE row and return it, unattached. A COMPONENT: city in, element out.
 *
 * `data-city` and `data-state` are the contract. The second one is what makes this
 * gradeable and — more usefully — what makes it debuggable: open the Elements tab, press
 * refresh, and watch one attribute go `idle` → `loading` → `fresh`.
 */
function cityRow(city, now) {
  const { view, entry, ageMs, error } = viewOf(city.id, now);

  const li = document.createElement('li');
  li.className = 'city';
  li.dataset.city = city.id;
  li.dataset.state = view;

  const name = document.createElement('h2');
  name.className = 'city-name';
  name.textContent = city.name;

  const refresh = document.createElement('button');
  refresh.type = 'button';
  refresh.className = 'refresh';
  refresh.disabled = view === 'loading';
  refresh.setAttribute('aria-label', `רענן את ${city.name}`);
  const refreshText = document.createElement('span');
  refreshText.textContent = view === 'loading' ? 'טוען…' : 'רענן';
  refresh.append(refreshText);

  const head = document.createElement('div');
  head.className = 'city-head';
  head.append(name, refresh);
  li.append(head);

  /*
   * A READING IS SHOWN WHENEVER THERE IS ONE — including next to a failure. That is the
   * whole argument for a cache: "we could not reach the service, and here is what it
   * said eleven minutes ago" is far more useful than an empty card, AS LONG AS IT SAYS
   * BOTH HALVES. A stale number with no label is a lie with a timestamp attached to
   * nothing.
   */
  if (entry !== undefined) {
    const temp = document.createElement('p');
    temp.className = 'city-temp';
    temp.textContent = `${Math.round(entry.temperature)}°`;

    const sky = document.createElement('p');
    sky.className = 'city-sky';
    sky.textContent = WEATHER_CODES[entry.code] ?? `קוד מזג אוויר ${entry.code}`;

    const wind = document.createElement('p');
    wind.className = 'city-wind';
    wind.textContent = `רוח ${Math.round(entry.wind)} קמ"ש`;

    const age = document.createElement('p');
    age.className = 'city-age';
    age.textContent =
      view === 'stale' || view === 'error'
        ? `נמדד ${describeAge(ageMs)} · לא מעודכן`
        : `נמדד ${describeAge(ageMs)}`;

    li.append(temp, sky, wind, age);
  } else if (view === 'idle') {
    const empty = document.createElement('p');
    empty.className = 'city-empty';
    empty.textContent = 'עוד לא נמדד. לחץ "רענן".';
    li.append(empty);
  }

  if (view === 'error') {
    const problem = document.createElement('p');
    problem.className = 'city-error';
    problem.setAttribute('role', 'alert');
    problem.textContent = error;
    li.append(problem);
  }

  return li;
}

/** THE render function. One entry point, called on every state change. Synchronous. */
function render() {
  const now = Date.now();

  document.querySelector('#cities').replaceChildren(...CITIES.map((city) => cityRow(city, now)));

  const { cached, total, stale, oldest } = summarise(now);
  document.querySelector('#summary').textContent =
    cached === 0
      ? 'אין עדיין שום מדידה שמורה.'
      : `${cached} מתוך ${total} ערים במטמון` +
        (stale > 0 ? ` · ${stale} מהן לא מעודכנות` : '') +
        ` · הישנה ביותר נמדדה ${describeAge(oldest)}`;

  const note = document.querySelector('#storage-note');
  note.hidden = state.storageError === null;
  note.textContent = state.storageError ?? '';
}

/* ── Events ───────────────────────────────────────────────────────────────── */

/** One controller per city, so refreshing one does not cancel another. */
const controllers = new Map();

/**
 * Fetch one city and put the answer where it belongs.
 *
 * THE ORDER MATTERS AND IT IS THE SAME ORDER AS WEEK 11's: say "loading" BEFORE the
 * await, because the code after an await does not run during the wait — it runs when the
 * waiting is over.
 */
async function refreshCity(cityId, { signal } = {}) {
  const city = CITIES.find((entry) => entry.id === cityId);
  if (city === undefined) return;

  // CODE HERE (2 of 4) — the whole body.
  //
  //   1. say 'loading' for this city — BEFORE the await. The code after an await does
  //      not run during the wait; it runs when the waiting is over.
  //   2. `await fetchWeather(city, { signal })`
  //   3. write it to disk, THEN to state — so a failed write is known before the screen
  //      claims the value is saved. `writeOne` returns whether it worked; if it did not,
  //      put a sentence in `state.storageError`.
  //   4. clear this city's status, whichever way it went.
  //
  // And in the catch, IN THIS ORDER:
  //   · `error.name === 'AbortError'` -> return, touching nothing. Somebody pressed
  //     "refresh all" twice. Nothing is wrong and the row must not go red.
  //   · otherwise put the SENTENCE into state — `error.messageHe` for an ApiError, and
  //     something generic for anything else. Never the exception itself: `render` may
  //     not decide what a failure says.
}

/**
 * Refresh every city at once.
 *
 * `Promise.allSettled` AND NOT `Promise.all`, and the reason is the whole slide: with
 * `all`, one city that fails throws away the five that succeeded — and here they have
 * ALREADY been written to disk and to state by the time it rejects, so the rejection
 * would be discarding nothing except the caller's chance to say what happened.
 *
 * `allSettled` never rejects, so the button always finishes, and the summary line below
 * is computed from what actually landed.
 */
let allController = null;

async function refreshAll() {
  /* Pressing it again cancels the previous sweep. Every one of those cancellations
     arrives as an AbortError, and `refreshCity` returns without touching state. */
  allController?.abort();
  allController = new AbortController();
  const { signal } = allController;

  const button = document.querySelector('#refresh-all');
  button.disabled = true;

  // CODE HERE (3 of 4) — refresh all six AT ONCE.
  //
  // `Promise.allSettled` and NOT `Promise.all`, and be able to say why: with `all`, one
  // city that fails throws away the five that succeeded. Here they have already been
  // written to disk by the time it rejects, so the rejection discards nothing except
  // your chance to say what happened — and the button never re-enables.
  //
  // Six requests at once, not six awaits in a row. The difference is six times the
  // wall clock, for six requests that have nothing to do with each other.

  button.disabled = false;
}

function wire() {
  /* ONE listener for every refresh button that will ever exist, on the <ul> — which
     render() empties but never replaces. Week 8's delegation, still earning its keep. */
  document.querySelector('#cities').addEventListener('click', (event) => {
    if (!event.target.closest('button.refresh')) return;
    const row = event.target.closest('li[data-city]');
    if (row) refreshCity(row.dataset.city);
  });

  document.querySelector('#refresh-all').addEventListener('click', refreshAll);

  document.querySelector('#clear-cache').addEventListener('click', () => {
    /* The one destructive control, and therefore the only one that asks first. */
    if (!confirm('למחוק את כל המדידות השמורות?')) return;
    clearCache();
    setState({ cache: {}, status: {}, storageError: null });
  });

  // CODE HERE (4 of 4), and it is one line — the stretch tier.
  //
  // "Fresh" is DERIVED from the current time, so a tab left open for eleven minutes is
  // showing a badge that stopped being true without anything happening on the page.
  // Something has to re-draw. Once a minute is plenty, and it costs nothing: `render`
  // is synchronous and reads two objects.
}

/*
 * BOOT. THE FIRST PAINT TOUCHES NOTHING.
 *
 * The page draws from the cache and stops. That is a decision, not an omission: an
 * application whose first paint waits on six requests shows a white rectangle on a bad
 * connection and nothing at all on no connection. With a cache it can show six real
 * readings, instantly, offline.
 */
wire();
render();

// CODE HERE — the CHALLENGE tier. Stale-while-revalidate, and the order is the pattern:
//
//   1. draw what you have — already done, on the line above
//   2. THEN refresh the cities whose reading is `stale`
//   3. and DO NOT replace the number with a spinner while you do it
//
// Step 3 is the one people lose, and it is the half of this tier that is read by a
// human rather than by a check. A background refresh that sets `loading` on a row which
// already has a number has traded
// real data for a placeholder — which is precisely what this pattern exists to prevent.
// A row with NOTHING to show still gets a spinner; a spinner beats an empty card.
//
// One more thing worth doing and easy to miss: defer it by a frame. `render()` above has
// queued a paint that has not happened yet, and opening six requests in the same task
// delays it.
