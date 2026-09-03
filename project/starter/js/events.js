/*
 * ============================================================================
 * events.js — the third layer. Handlers translate what the user did into a state
 * change, and then stop.
 *
 * The shape EVERY handler in this file follows:
 *
 *     read the event  →  compute the next state  →  setState / commitItems
 *
 * No handler writes to the DOM to show its own result. It changes state, the
 * subscription in app.js calls `render(state)`, and the page catches up. That
 * indirection is the whole architecture: it is why there is no path here that can
 * leave the screen and the data disagreeing, and it is why "add a feature" in week 13
 * is a change to a pure function rather than an edit to eleven places that all poke
 * at the list.
 *
 * If you find yourself writing `element.innerHTML = …` in this file, stop. That is
 * requirement 2.6 in the points table and it is read by a human.
 *
 * ── EVENT DELEGATION, AND WHY IT IS NOT AN OPTIMISATION HERE
 *
 * Listeners are attached ONCE, to the containers, never to the cards. That is not
 * about performance — it is a correctness requirement of `render(state)`. The cards
 * are destroyed and rebuilt on every state change, so a listener attached to a button
 * is attached to an element that will not exist a moment later. The bug it produces
 * is the classic one: everything works until the first re-render, and then exactly
 * the controls the user has already touched stop responding.
 *
 * So: `data-action` on the element, and the container reads it. Adding a control means
 * adding a `case` below and an attribute in render.js — never a new listener.
 * ============================================================================
 */
import { getState, setState, commitItems, selectOne } from './state.js';
import { render, renderNotice } from './render.js';
import { searchCatalogue, searchOffline, ApiError } from './api.js';

/**
 * The item this page is about, when it is about one.
 *
 * STATIC controls on the detail page cannot carry a `data-id` — they are written once
 * in HTML, and the id only exists in the query string. This is where they read it from.
 */
const currentId = () => new URLSearchParams(location.search).get('id');

/**
 * The last thing removed, kept only long enough to undo it.
 *
 * Module-local rather than in state: this is not a fact about the collection, it is a
 * fact about the last few seconds. Putting it in state would mean an expiring value
 * inside the single source of truth.
 */
let lastRemoved = null;
const UNDO_MS = 8000;
let undoTimer = 0;

/**
 * Show a notice, and move keyboard focus to its undo button when there is one.
 *
 * THIS IS THE FOCUS-MANAGEMENT RULE, and it exists because of a specific failure: the
 * user activates "remove", the card is destroyed by the re-render, and the element
 * that had focus no longer exists. The browser's fallback is to drop focus to
 * `<body>` — so a keyboard user is silently returned to the top of the document and
 * has to tab back through everything, and a screen-reader user is given no indication
 * that anything happened at all.
 *
 * When focus is destroyed, something has to catch it, and the right catcher is
 * whatever the user would most plausibly do next. After a removal that is "undo".
 */
function notify(notice, { takeFocus = false } = {}) {
  clearTimeout(undoTimer);
  renderNotice(notice);
  if (notice === null) return;

  if (takeFocus) {
    const undo = document.querySelector('#notice [data-action="undo"]');
    if (undo instanceof HTMLElement) undo.focus();
  }

  /*
   * The offer expires, and the undo data goes with it — an "undo" button that quietly
   * does nothing because its data is gone is worse than no button. Only the undo
   * notice is timed; a "could not save" message stays, because it is still true.
   */
  if (notice.undo) {
    undoTimer = setTimeout(() => {
      lastRemoved = null;
      renderNotice(null);
    }, UNDO_MS);
  }
}

/**
 * Report a failed write. Call this after EVERY `commitItems`.
 *
 * The collection on screen has already changed; if the write failed, the user is
 * looking at something that will not survive a reload, and that is not a detail to
 * leave in the console. Requirement 16.
 */
function reportWrite(result, success) {
  if (result.ok) {
    notify(
      { text: success.text, tone: 'ok', ...(success.undo ? { undo: success.undo } : {}) },
      {
        takeFocus: Boolean(success.undo),
      },
    );
    return;
  }
  notify({ text: result.reason ?? 'השינוי לא נשמר.', tone: 'danger' });
}

/**
 * A monotonically increasing ticket per search request.
 *
 * THE STALE-RESPONSE GUARD. Type one term, then immediately another. Two requests are
 * now in flight and there is no guarantee they return in order — the first can land
 * second and overwrite the results for a term the user is no longer looking at.
 * Nothing about the URL or the response says which is which.
 *
 * So each request takes a ticket, and a response may only write to state if its ticket
 * is still the newest. This is the bug that is invisible on a fast connection, obvious
 * on a slow one, and impossible to reproduce on demand.
 */
let searchTicket = 0;

async function runSearch(term, mode) {
  const trimmed = term.trim();

  if (trimmed === '') {
    setState({ search: { term: '', status: 'empty', results: [], error: null, source: null } });
    return;
  }

  const ticket = ++searchTicket;
  setState({ search: { ...getState().search, term: trimmed, status: 'loading', error: null } });

  try {
    const results =
      mode === 'offline' ? await searchOffline(trimmed) : await searchCatalogue(trimmed);
    if (ticket !== searchTicket) return; // a newer search has already started

    setState({
      search: {
        term: trimmed,
        /*
         * NO RESULTS IS `empty`, not `success` with an empty array. They are different
         * things to say to the user, and render.js has a different panel for each.
         */
        status: results.length === 0 ? 'empty' : 'success',
        results,
        error: null,
        source: mode === 'offline' ? 'offline' : 'live',
      },
    });
  } catch (err) {
    if (ticket !== searchTicket) return;

    /*
     * The Hebrew sentence comes from api.js, which is the layer that knows what went
     * wrong. The machine detail goes to the console for whoever is debugging, and
     * never to the user.
     */
    const messageHe = err instanceof ApiError ? err.messageHe : 'משהו נכשל בחיפוש. אפשר לנסות שוב.';
    if (!(err instanceof ApiError)) console.error('unexpected search failure', err);

    setState({
      search: {
        ...getState().search,
        term: trimmed,
        status: 'error',
        results: [],
        error: messageHe,
        source: null,
      },
    });
  }
}

/* ==========================================================================
   Collection mutations. Each one is: build the next array, commit it, say what
   happened. None of them touches the DOM.
   ========================================================================== */

function addItem(id) {
  const state = getState();
  // CODE HERE — find the item in state.search.results, refuse a duplicate, build the
  //             new entry (an ISO timestamp, not a locale string — it is sorted), and
  //             commit: reportWrite(commitItems([...state.items, entry]), { text: … })
}

function removeItem(id) {
  const state = getState();
  const item = selectOne(state, id);
  if (!item) return;

  lastRemoved = { items: [item], label: /* CODE HERE — the item's name */ '' };
  // CODE HERE — commit the collection without this id, and offer undo:
  //             reportWrite(commitItems(next), { text: …, undo: 'בטל הסרה' })
}

function undoRemoval() {
  if (lastRemoved === null) return;
  const { items, label } = lastRemoved;
  lastRemoved = null;

  /*
   * Restored, then re-sorted by the selector rather than spliced back at its old
   * index. `selectVisible` decides the order from state, so there is no "position in
   * the list" to restore — one of the things the architecture buys you.
   */
  const state = getState();
  // CODE HERE — put the items back, skipping any id that is somehow already there
}

function editItem(id, patch) {
  const state = getState();
  /*
   * Build a NEW array with a NEW object for the one that changed:
   *
   *   state.items.map((item) => (item.id === id ? { ...item, ...patch } : item))
   *
   * Not `item.field = value`. Mutating in place works today and breaks the moment
   * anything compares old state with new — and it is the habit that makes week 9's
   * mini-surgery hard.
   */
  // CODE HERE
}

/* ==========================================================================
   Wiring. Called once per page by app.js.
   ========================================================================== */

export function wire() {
  /*
   * ONE click listener for the whole document.
   *
   * `closest('[data-action]')` rather than checking `event.target` directly: the click
   * lands on whatever is under the pointer, and for a button containing a `<span>`
   * that is the span, not the button. `event.target` alone is the single most common
   * reason a delegated handler "randomly" does nothing.
   */
  document.addEventListener('click', (event) => {
    const trigger = event.target instanceof Element ? event.target.closest('[data-action]') : null;
    if (!(trigger instanceof HTMLElement)) return;

    const { action, id } = trigger.dataset;

    switch (action) {
      case 'add':
        if (id) addItem(id);
        break;

      case 'remove': {
        /* `data-id` when the control was rendered per item; the URL when it is the
           static button on the detail page. One action, because it is one action. */
        const target = id ?? currentId();
        if (target) removeItem(target);
        break;
      }

      case 'undo':
        undoRemoval();
        break;

      case 'retry':
        void runSearch(getState().search.term, 'live');
        break;

      case 'offline':
        void runSearch(getState().search.term, 'offline');
        break;

      case 'clear-filters': {
        setState({ query: '' /* CODE HERE — reset your other filter fields too */ });
        /*
         * The one place this file touches the DOM, and it is not rendering — it is
         * resetting an UNCONTROLLED input, which by definition holds its own value
         * (render.js rule 1). State is already correct; the box on screen needs telling.
         */
        const box = document.getElementById('list-query');
        if (box instanceof HTMLInputElement) box.value = '';
        break;
      }

      // CODE HERE — your own actions: 'save', 'edit', and whatever your topic needs

      default:
        break;
    }
  });

  /* `change` for selects and radio groups, delegated the same way. */
  document.addEventListener('change', (event) => {
    const el = event.target;

    if (el instanceof HTMLSelectElement && el.id === 'list-filter') {
      // CODE HERE
      return;
    }

    if (el instanceof HTMLSelectElement && el.id === 'list-sort') {
      setState({ sort: el.value });
    }

    // CODE HERE — your rating / status controls, if you have them
  });

  /*
   * The list filter fires on `input`, so the list narrows as you type. That is the
   * right choice HERE and the wrong one for validation, and the difference is worth
   * being explicit about:
   *
   *   Filtering as you type is HELP. Every keystroke shows you more of what you
   *   wanted, and there is no wrong intermediate state.
   *
   *   Validating as you type is NAGGING. "Not a valid email" after the second
   *   character is true, useless, and it trains people to ignore the message.
   *
   * So: local filtering on `input`; forms validate on `submit`. And if your search
   * hits the NETWORK, it must be on submit too — some endpoints rate-limit to one
   * request per second and a call per keystroke will get you blocked.
   */
  const filter = document.getElementById('list-query');
  if (filter instanceof HTMLInputElement) {
    filter.addEventListener('input', () => setState({ query: filter.value }));
  }

  const form = document.getElementById('search-form');
  if (form instanceof HTMLFormElement) {
    form.addEventListener('submit', (event) => {
      /*
       * Without this the form navigates and the whole application reloads — the single
       * most common "my handler runs and then everything resets" bug.
       */
      event.preventDefault();
      const field = document.getElementById('search-term');
      if (field instanceof HTMLInputElement) void runSearch(field.value, 'live');
    });
  }
}

/**
 * Report what storage had to say at boot.
 *
 * `hydrate()` returns a reason when the saved value was missing, corrupt, or held rows
 * this version of the code could not read. The user is told, because "your collection
 * is empty" and "we could not read your collection" are very different pieces of news
 * to receive on opening the page.
 */
export function reportHydration(result) {
  if (result.reason === null) return;
  notify({ text: result.reason, tone: 'warn' });
}
