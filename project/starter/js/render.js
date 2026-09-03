/*
 * ============================================================================
 * render.js — state in, HTML out. This file reads state and writes the DOM. It never
 * mutates state, attaches no listeners, and calls no API.
 *
 * Note the import list below: SELECTORS ONLY. `setState` and `commitItems` are
 * deliberately absent, so this file cannot change state even by accident — enforced
 * by the imports rather than by a comment asking nicely.
 *
 * ── THREE RULES THAT KEEP `render(state)` FROM BEING A BUG FACTORY
 *
 * 1. NO CONTROL THE USER OPERATES LIVES INSIDE A RENDERED REGION.
 *    Replacing a region's innerHTML destroys the elements in it — including the one
 *    that currently has focus. So every `<input>`, `<textarea>`, `<select>` and every
 *    repeatedly-used button lives in STATIC markup, outside anything this file
 *    rewrites, and is read on demand or synced from state.
 *
 *    The failure this prevents is worth knowing before you meet it: put a radio group
 *    inside a rendered region and selecting an option fires `change`, which commits
 *    state, which re-renders, which destroys the focused radio — and focus falls to
 *    `<body>`. A keyboard user can use the control exactly once. It is invisible to a
 *    mouse and invisible to any test that only asserts the value changed.
 *
 *    ONE APPARENT EXCEPTION, AND IT IS NOT ONE: a `<select>`'s `<option>` list may be
 *    rebuilt, because the `<select>` ELEMENT itself is not replaced — only its
 *    children. Replacing the children of a focused control is fine; replacing the
 *    control is not.
 *
 * 2. A LIVE REGION ELEMENT IS STATIC; ONLY ITS TEXT CHANGES.
 *    A screen reader announces changes to the CONTENTS of an element it is already
 *    watching. Replace the element itself and there is nothing to notice — the
 *    announcement is silently lost, and the page still passes every automated check.
 *    So write `textContent` into it and never re-create it.
 *
 * 3. EVERYTHING INTERPOLATED IS ESCAPED.
 *    Your items come from an HTTP response and your notes come from the user. Both go
 *    through `esc()`. This is not theoretical: at least one endpoint in the topic pool
 *    returns HTML in a text field, and requirement 39 is graded by injecting
 *    `<img onerror>` into one of your text inputs.
 * ============================================================================
 */
import { selectVisible, selectFilterValues, selectSummary } from './state.js';

/**
 * Escape a value for interpolation into markup.
 *
 * Written for you, because getting it wrong is worse than not having it. `&` MUST be
 * replaced first — otherwise the ampersands introduced by the later replacements get
 * escaped a second time and `&lt;` renders as the literal text `&lt;`.
 */
export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/*
 * Shared class lists. ONE definition, used everywhere — week 5's component argument,
 * with a real place to put the answer now that there is JavaScript.
 *
 * Add `motion-safe:` to every transition you write. It compiles to
 * `@media (prefers-reduced-motion: no-preference)`, so the animation does not exist
 * for a reader who asked for stillness — nothing to undo, no `!important`.
 */
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold ' +
  'motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
export const BTN_PRIMARY = `${BTN} bg-brand text-brand-ink hover:bg-brand-strong`;
export const BTN_QUIET = `${BTN} border border-control text-ink hover:bg-surface`;
export const BTN_DANGER = `${BTN} border border-danger text-danger hover:bg-danger-soft`;
export const PANEL = 'rounded-card border border-line bg-surface p-6';

/**
 * One card in the list.
 *
 * Two things the grader looks at:
 *   · Every value that came from outside goes through `esc()`.
 *   · A per-item button's accessible name INCLUDES the item's name. Forty buttons that
 *     all announce "הסר" are forty identical buttons to anyone reading them out of
 *     context — and "remove", with no object, is exactly the control you do not want
 *     to activate by accident.
 */
function itemCard(item) {
  // CODE HERE — one <li> per item: its fields, a link to the detail page, its actions.
  //             Give every action button `data-action` and `data-id` (see events.js).
  return '';
}

/* ==========================================================================
   The four states. One branch per value of `search.status` — so if you ever add a
   fifth status, this switch is what tells you it has nowhere to render.
   ========================================================================== */

function searchStates(search, state) {
  switch (search.status) {
    /*
     * EMPTY, and there are TWO of them sharing this branch. `search.term` is what
     * tells them apart: nothing searched yet, versus a search that matched nothing.
     * They must not share a sentence — "no results" before the user has typed
     * anything reads as a broken application.
     */
    case 'empty':
      // CODE HERE — two different panels, chosen on whether search.term is ''
      return '';

    /*
     * LOADING. Prefer skeletons the same shape and size as the real results over a
     * spinner: the layout will not jump when the data lands, and the user can see how
     * much is coming. Put `aria-hidden="true"` on the whole block — the announcement
     * is the live region's job, and six fake cards read aloud are noise. Any pulse
     * goes behind `motion-safe:`.
     */
    case 'loading':
      // CODE HERE
      return '';

    /*
     * ERROR. Three things every error state owes the user: what went wrong in a
     * sentence they can act on (`search.error`), a way to try again
     * (`data-action="retry"`), and — where one exists — a way to get on with the task
     * anyway (`data-action="offline"`).
     */
    case 'error':
      // CODE HERE
      return '';

    /*
     * SUCCESS. Say where the data came from (`search.source`): "24 results" from the
     * live endpoint and "3 results" from the bundled file are different facts, and the
     * user is entitled to know which they are looking at.
     */
    case 'success':
      // CODE HERE
      return '';

    default:
      return '';
  }
}

/**
 * One short sentence for the live region.
 *
 * Short and complete. A live region that reads out a whole panel interrupts whatever
 * the user was doing with forty words; this is the one sentence they need.
 */
export function searchAnnouncement(search) {
  // CODE HERE — one sentence per status
  return '';
}

/* ==========================================================================
   Region renderers. Each one returns immediately when its mount element is absent —
   which is what lets ONE render(state) serve three different pages without knowing
   which page it is on.
   ========================================================================== */

function renderList(state) {
  const mount = document.getElementById('list');
  if (!mount) return;

  const visible = selectVisible(state);

  /*
   * The count reads "N of M". After a filter those two numbers differ, and the
   * difference is exactly what the user needs in order to understand why the list
   * looks short.
   */
  const count = document.getElementById('list-count');
  if (count) {
    // CODE HERE
  }

  /*
   * THREE DIFFERENT EMPTY STATES LIVE HERE, and they are not interchangeable:
   *   · the collection is genuinely empty          → "add your first one"
   *   · the collection has items, the filter hides them all → say how many exist,
   *     and offer a button that clears the filter, because the user's own controls
   *     are the cause and they deserve to be told
   *   · (the search region's empties are separate — see above)
   */
  // CODE HERE — the two branches, then the list itself

  mount.innerHTML = `<ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">${visible.map(itemCard).join('')}</ul>`;
}

function renderSearch(state) {
  const mount = document.getElementById('search-results');
  if (!mount) return;
  mount.innerHTML = searchStates(state.search, state);

  /* Rule 2: write the live region's TEXT. Never replace the element. */
  const status = document.getElementById('search-status');
  if (status) status.textContent = searchAnnouncement(state.search);
}

function renderFilters(state) {
  const select = document.getElementById('list-filter');
  if (!(select instanceof HTMLSelectElement)) return;
  // CODE HERE — rebuild the <option>s from selectFilterValues(state); see rule 1's exception
}

/** The detail page. `id` comes from the query string. */
function renderDetail(state, id) {
  const mount = document.getElementById('detail');
  if (!mount) return;

  /*
   * An id that is not in the collection is an EMPTY state, not an error — an old
   * link, an item removed in another tab, a hand-edited URL. None of those is a
   * failure and none should look like one: say what happened and offer the way back.
   *
   * Requirement 9, and the grader visits `?id=does-not-exist` to check it.
   */
  // CODE HERE

  /*
   * The page's `<h1>` is STATIC markup whose TEXT you set here. Rendering the heading
   * itself means that for the instant before the first render the page has no h1 at
   * all — and a screen reader landing in that instant finds a document with no title.
   */
  // CODE HERE — set the text of #detail-title, and document.title
}

function renderSummary(state) {
  const mount = document.getElementById('summary');
  if (!mount) return;

  const summary = selectSummary(state);

  /*
   * An empty collection gets an empty state here too, not a page of zeroes and blank
   * charts. "Average: 0" is a claim that everything is terrible.
   *
   * And if you draw a chart: make it an HTML table. Every number the bar encodes must
   * also be present as TEXT, the bar itself gets `aria-hidden="true"`, and a
   * `<caption>` plus `<th scope="row">` per row makes it navigable as what it
   * actually is. A chart whose only output is a shape excludes people — and no chart
   * library is allowed anyway (requirement 5.4).
   */
  // CODE HERE
}

/**
 * Show a message in the page's notice strip.
 *
 * Called directly by events.js, NOT from `render(state)` — it is transient feedback
 * about an action ("added", "removed — undo?"), so putting it in state would mean
 * storing "this happened four seconds ago" and re-rendering on a timer to expire it.
 * Every other pixel on screen is a function of state; this exception is worth naming
 * rather than hiding.
 *
 * On a destructive action, prefer UNDO over "are you sure?". A confirmation charges
 * every user for the mistakes of the few, and after a week people click through it
 * without reading. Undo costs nothing up front and also covers the deletion the user
 * meant at the time and regretted ten seconds later. The rule: confirm only what
 * cannot be undone.
 */
export function renderNotice(notice) {
  const mount = document.getElementById('notice');
  if (!mount) return;

  if (notice === null) {
    mount.innerHTML = '';
    return;
  }

  // CODE HERE — render notice.text, and an undo button (`data-action="undo"`) when
  //             notice.undo is set. Use tone to pick between ok / warn / danger.
}

/**
 * THE render function. One entry point, called on every state change, for every page.
 *
 * It does not know which page it is on: each region renderer returns immediately when
 * its mount is absent. Adding a page means adding a mount and a renderer, and
 * changing nothing in here.
 */
export function render(state) {
  renderSearch(state);
  renderFilters(state);
  renderList(state);
  renderSummary(state);

  const id = new URLSearchParams(location.search).get('id');
  if (id !== null) renderDetail(state, id);
}
