/*
 * ============================================================================
 * render.js — LAYER 2 OF 5. State goes in. The screen comes out.
 *
 * INSTRUCTOR MATERIAL, and the file students read after grading.
 *
 * NOTHING IN THIS FILE KNOWS THAT ANYTHING IS BEING SAVED, AND NOTHING IN IT KNOWS
 * THERE IS A NETWORK. Search it for `localStorage`, for `JSON`, for `fetch`, for
 * `await`, for `http` — nothing. It draws one new region this week and that region is
 * about a REQUEST, which is the most temporal thing in the application; it is still
 * drawn from a plain object, synchronously, the same way a list of six groceries is.
 *
 * THERE IS NO `async` IN THIS FILE AND THERE MUST NOT BE. A painter that awaits is a
 * painter that can be halfway through when the next state arrives, and two half-painted
 * screens on top of each other is a bug with no reproduction steps. Everything that
 * waits waits in events.js; by the time `render` runs, the answer is already a fact.
 *
 * The prohibitions are unchanged. Nothing here changes state, registers a listener,
 * or reads the DOM to decide what to draw.
 *
 * TWO DOCUMENTED EXCEPTIONS IN THE WHOLE APPLICATION, and they are the same exception
 * twice: a browser control is handed back a value it owns.
 *   1. `renderFilters` reads the <select>'s value before rebuilding its options and
 *      puts it back afterwards (week 9).
 *   2. The add/edit form's FIELDS are not drawn from state at all — they are filled by
 *      events.js when editing starts, and read by events.js on submit. What IS drawn
 *      from state is the form's MODE: which button label, whether "cancel" is offered,
 *      and which row is marked. See `renderFormMode` below, and the header of
 *      events.js for why the fields themselves cannot be in the loop.
 * ============================================================================
 */
import {
  selectCategories,
  selectEditing,
  selectNewSuggestions,
  selectOne,
  selectSearchView,
  selectSummary,
  selectVisible,
} from './state.js';

/**
 * Build ONE row and return it, unattached. A COMPONENT: item in, element out.
 *
 * `data-id`, never `data-index`. Unchanged from week 9, and this week it earns its
 * keep twice more: an id is what the edit button carries, and an id is what survives
 * `JSON.stringify` and comes back meaning the same thing. An array position does not
 * survive a sort, let alone a reload.
 *
 * @param {{ id: string, title: string, number: number, category: string, created: string }} item
 * @param {string | null} editingId  which row is open in the form, so it can be marked
 * @returns {HTMLLIElement}
 */
export function itemRow(item, editingId = null) {
  const li = document.createElement('li');
  li.dataset.id = item.id;
  li.className =
    'flex flex-wrap items-center gap-3 rounded-lg border p-4 ' +
    (item.id === editingId ? 'border-brand bg-panel' : 'border-line');

  const title = document.createElement('a');
  title.className = 'item-title flex-1 font-semibold text-brand underline underline-offset-4';
  title.href = `item.html?id=${encodeURIComponent(item.id)}`;
  title.textContent = item.title;

  const category = document.createElement('span');
  category.className = 'item-category rounded-md bg-panel px-2 py-1 text-sm text-muted';
  category.textContent = item.category;

  const number = document.createElement('span');
  number.className = 'item-number w-10 text-center text-sm text-muted';
  number.textContent = item.number;

  li.append(title, category, number);

  for (const [cls, label, aria] of [
    ['plus', '+1', `הוסף אחד ל${item.title}`],
    ['edit', 'ערוך', `ערוך את ${item.title}`],
    ['remove', 'הסר', `הסר את ${item.title}`],
  ]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className =
      `${cls} rounded-md border border-line px-3 py-1 text-sm ` +
      'focus-visible:outline-2 focus-visible:outline-offset-2 ' +
      (cls === 'remove' ? 'hover:border-bad hover:text-bad' : 'hover:border-brand');
    /* A <span> inside the button, so `event.target` is usually NOT the button itself.
       The delegated handler is written for that, which is the only way it stays
       correct when somebody later puts an icon in here. */
    const text = document.createElement('span');
    text.textContent = label;
    button.append(text);
    button.setAttribute('aria-label', aria);
    li.append(button);
  }

  return li;
}

/** The list, its counter and its two empty states. */
function renderList(state) {
  const list = document.querySelector('#list');
  if (!list) return;

  const visible = selectVisible(state);

  list.replaceChildren(...visible.map((item) => itemRow(item, state.editingId)));
  document.querySelector('#count').textContent = visible.length;

  /* Two empty states, not one, and the sentence says which — because "there is
     nothing here" sends the user to the add form and "nothing matched" sends them to
     the search box. From this week there is a third thing an empty pantry can mean,
     and the wording has to survive it: an empty collection that was SAVED empty is
     not a fresh start, and telling a user who just deleted everything to "add your
     first item" is at least not a lie. */
  const empty = document.querySelector('#empty');
  const nothingAtAll = state.items.length === 0;
  empty.hidden = visible.length > 0;
  empty.querySelector('span').textContent = nothingAtAll
    ? 'אין כאן כלום. הוסף פריט בטופס שלמעלה.'
    : 'שום פריט לא מתאים לחיפוש ולסינון הנוכחיים.';

  /* The offer to restore the demo data belongs to the first of the two empty states
     only. Offering "restore the demo data" to somebody whose search matched nothing
     is offering to delete the collection they are searching. */
  document.querySelector('#reset-demo').hidden = !nothingAtAll;
}

/**
 * The form's MODE — not its fields. See the file header.
 *
 * Three things, all derived from one nullable field: what the submit button says,
 * whether there is a way out, and a sentence naming what is being edited. A user who
 * clicked "ערוך" and then scrolled has no other way to find out why "הוסף" now
 * replaces something.
 */
function renderFormMode(state) {
  const submit = document.querySelector('#form-submit');
  if (!submit) return;

  const editing = selectEditing(state);

  submit.textContent = editing === null ? 'הוסף' : 'שמור';
  document.querySelector('#form-cancel').hidden = editing === null;
  document.querySelector('#form-mode').textContent =
    editing === null ? '' : `עורך את "${editing.title}"`;
}

/**
 * A sentence when a write failed, and nothing at all when it did not.
 *
 * THE POINT OF WRAPPING EVERY ACCESS IS THIS ELEMENT. A `try { … } catch {}` with an
 * empty body gives the user an application that looks exactly like one that is saving
 * and is not, and they find out when they close the tab. Two failures, two different
 * sentences, because they need two different things from the user.
 */
function renderStorageNote(state) {
  const note = document.querySelector('#storage-note');
  if (!note) return;

  const text = {
    blocked:
      'הדפדפן חוסם שמירה מקומית באתר הזה, ולכן השינויים לא יישמרו. ' +
      'בדפדפן פרטי או כשעוגיות חסומות זה מצב רגיל.',
    full: 'אין מקום פנוי לשמירה, והשינוי האחרון לא נשמר. נקה פריטים או השתמש ב"נקה הכול".',
  }[state.storageError];

  note.hidden = text === undefined;
  note.textContent = text ?? '';
}

/**
 * Build ONE suggestion row and return it, unattached. A COMPONENT, exactly like
 * `itemRow` — and the fact that its data arrived over a network changes nothing about
 * how it is drawn, which is the point.
 *
 * @param {{ title: string, note: string, url: string }} suggestion
 * @returns {HTMLLIElement}
 */
export function suggestionRow(suggestion) {
  const li = document.createElement('li');
  /* The identity of the row, and what the delegated handler reads. A title rather than
     an id because the catalogue has no ids of its own — and it is the honest key here:
     two suggestions with the same title ARE the same suggestion. */
  li.dataset.title = suggestion.title;
  li.className = 'grid gap-2 rounded-lg border border-line p-4';

  const head = document.createElement('div');
  head.className = 'flex flex-wrap items-center gap-3';

  const title = document.createElement('span');
  title.className = 'suggestion-title flex-1 font-semibold';
  title.textContent = suggestion.title;

  const adopt = document.createElement('button');
  adopt.type = 'button';
  adopt.className =
    'adopt rounded-md border border-line px-3 py-1 text-sm hover:border-brand ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2';
  adopt.setAttribute('aria-label', `הוסף את ${suggestion.title} למזווה`);
  const adoptText = document.createElement('span');
  adoptText.textContent = 'הוסף למזווה';
  adopt.append(adoptText);

  head.append(title, adopt);
  li.append(head);

  /*
   * `textContent`, on a string that came off the internet and has been through nobody's
   * review. Week 8's rule has not moved, and this is the week it stops being
   * theoretical: with `innerHTML` here, whoever can edit that article can run code in
   * this page.
   */
  if (suggestion.note !== '') {
    const note = document.createElement('p');
    note.className = 'suggestion-note text-sm text-muted';
    note.textContent = suggestion.note;
    li.append(note);
  }

  const link = document.createElement('a');
  link.className = 'text-sm text-brand underline underline-offset-4';
  link.href = suggestion.url;
  link.target = '_blank';
  /* `noopener` is not optional on a `target="_blank"` link to a page you do not own:
     without it the opened page gets a handle on this one through `window.opener`. */
  link.rel = 'noopener noreferrer';
  link.textContent = 'לערך המלא';
  li.append(link);

  return li;
}

/**
 * THE SEARCH PANEL — five views, and exactly one of them at a time.
 *
 * ── THE ONE ATTRIBUTE THAT MAKES THIS GRADEABLE, AND DEBUGGABLE
 *
 * `#api-panel` carries `data-state`, and it always carries exactly one of the five
 * words. Open the Elements tab, type in the box, and watch it go
 * `idle` -> `loading` -> `results`. When something is wrong, that attribute says which
 * of the five the application thinks it is in, which is almost always the question.
 *
 * ── WHY IT IS AN ATTRIBUTE AND NOT FIVE BOOLEANS ON FIVE ELEMENTS
 *
 * Because five booleans can be in thirty-two combinations and only five of them mean
 * anything. The classic report — "it shows the spinner AND says nothing was found" —
 * is one of the other twenty-seven, and it cannot happen here: the value is computed
 * once, by `selectSearchView`, and the four regions below are hidden or shown FROM it
 * rather than each from its own condition.
 */
function renderSearch(state) {
  const panel = document.querySelector('#api-panel');
  if (!panel) return;

  const view = selectSearchView(state);
  panel.dataset.state = view;

  /* Four regions, one line each, and the condition is the same variable every time.
     `hidden` rather than `display: none` in a class: it is the platform's own answer,
     it takes the element out of the accessibility tree, and it cannot be overridden by
     a stylesheet somebody writes later. */
  document.querySelector('#api-idle').hidden = view !== 'idle';
  document.querySelector('#api-loading').hidden = view !== 'loading';
  document.querySelector('#api-empty').hidden = view !== 'empty';
  document.querySelector('#api-error').hidden = view !== 'error';

  /*
   * THE ERROR PANEL SAYS WHAT HAPPENED AND OFFERS WHAT WOULD HELP, and the second half
   * is the part people leave out. "Something went wrong" with no way forward is a dead
   * end; the kind of failure decides what is worth offering:
   *
   *   offline / timeout   both buttons. Trying again might work, and the local
   *                       catalogue definitely will.
   *   status / shape      the local catalogue only. The server answered, and it
   *                       answered the same thing it will answer next time.
   */
  const error = state.search.error;
  document.querySelector('#api-error-text').textContent = error?.messageHe ?? '';
  document.querySelector('#api-retry').hidden = !(
    error?.kind === 'offline' || error?.kind === 'timeout'
  );

  /*
   * The empty state's sentence names what was searched for. "Nothing found" is a
   * sentence about the application; "nothing found for X" is a sentence about the
   * user's question, and it is the one that tells them the box got what they typed.
   */
  document.querySelector('#api-empty-term').textContent = state.search.query;

  const fresh = selectNewSuggestions(state);
  document.querySelector('#api-results').replaceChildren(...fresh.map(suggestionRow));

  /*
   * WHICH CATALOGUE ANSWERED. Shown only when there is something on screen to be
   * suspicious of, and only when it is the local one — "we searched the internet" is
   * the default assumption and does not need saying, while "this came from a copy that
   * was frozen in August" absolutely does.
   */
  const source = document.querySelector('#api-source');
  source.hidden = !(view === 'results' && state.search.source === 'local');
  source.textContent =
    'התוצאות האלה מהקטלוג המקומי שנשמר עם היישום, ולא מהאינטרנט. ייתכן שהן לא מעודכנות.';
}

/** The shelf filter, whose options are derived from the collection. */
function renderFilters(state) {
  const select = document.querySelector('#category');
  if (!select) return;

  /* EXCEPTION 1. See the file header. */
  const chosen = select.value;

  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = 'הכול';

  select.replaceChildren(
    all,
    ...selectCategories(state).map((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      return option;
    }),
  );

  select.value = chosen;
  if (select.value === '') select.value = 'all';
}

/** The detail page. */
function renderDetail(state) {
  const mount = document.querySelector('#detail');
  if (!mount) return;

  const id = new URLSearchParams(location.search).get('id');
  const item = selectOne(state, id);

  const heading = document.createElement('h1');
  heading.className = 'text-2xl font-bold';

  if (item === null) {
    heading.textContent = 'הפריט לא נמצא';
    const explain = document.createElement('p');
    explain.className = 'mt-2 text-muted';
    explain.textContent =
      id === null
        ? 'הגעת לעמוד הזה בלי מזהה. בחר פריט מהרשימה.'
        : `אין במזווה פריט עם המזהה "${id}". ייתכן שהוא הוסר.`;
    mount.replaceChildren(heading, explain);
    document.title = 'המזווה — הפריט לא נמצא';
    return;
  }

  heading.textContent = item.title;

  const facts = document.createElement('dl');
  facts.className = 'mt-6 grid gap-3 rounded-lg border border-line bg-panel p-4 sm:grid-cols-2';
  for (const [label, value] of [
    ['מדף', item.category],
    ['כמות', item.number],
    /*
     * THE DATE, AND IT IS A STRING.
     *
     * `item.created` is an ISO 8601 string and never a `Date`, because a `Date` does
     * not survive the round trip: `JSON.stringify` turns it into exactly this string
     * (via `Date.prototype.toJSON`) and `JSON.parse` has no idea it was ever anything
     * else. An application that keeps `Date` objects in state works perfectly until
     * the first reload and then throws `created.getFullYear is not a function` from
     * inside `render` — which is the last place anybody looks for a storage bug.
     *
     * The rule: STORE THE STRING, CONVERT AT THE POINT OF USE. It is one line here
     * and there is no way to forget it.
     */
    ['נוסף', new Date(item.created).toLocaleDateString('he-IL')],
  ]) {
    const wrap = document.createElement('div');
    const dt = document.createElement('dt');
    dt.className = 'text-sm text-muted';
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.className = 'font-semibold';
    dd.textContent = value;
    wrap.append(dt, dd);
    facts.append(wrap);
  }

  mount.replaceChildren(heading, facts);

  /*
   * THE ENRICHMENT, AND IT IS FOUR LINES BECAUSE IT IS JUST DATA BY NOW.
   *
   * `note` and `source` are on the item only if it came from the catalogue; the six
   * seed groceries were typed and have neither. So the test is presence, not source —
   * this file has no idea a network exists and must not start caring now.
   *
   * The whole shape of the week is in the fact that this reads exactly like the two
   * fields above it. Something asynchronous, cancellable and capable of failing became,
   * by the time it reached here, a string on an object.
   */
  if (typeof item.note === 'string' && item.note !== '') {
    const note = document.createElement('p');
    note.className = 'item-note mt-6 text-muted';
    note.textContent = item.note;
    mount.append(note);
  }

  if (typeof item.source === 'string' && item.source !== '') {
    const link = document.createElement('a');
    link.className = 'item-source mt-2 inline-block text-brand underline underline-offset-4';
    link.href = item.source;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'המקור שממנו נלקח התיאור';
    mount.append(link);
  }

  document.title = `המזווה — ${item.title}`;
}

/** The summary page. */
function renderSummary(state) {
  const total = document.querySelector('#summary-count');
  if (!total) return;

  const summary = selectSummary(state);
  total.textContent = summary.total;
  document.querySelector('#summary-extra').textContent = summary.extra;

  document.querySelector('#summary-shelves').replaceChildren(
    ...summary.byCategory.map(({ category, count }) => {
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between rounded-lg border border-line p-3';
      li.dataset.category = category;

      const name = document.createElement('span');
      name.className = 'shelf-name font-semibold';
      name.textContent = category;

      const value = document.createElement('span');
      value.className = 'shelf-count text-muted';
      value.textContent = count;

      li.append(name, value);
      return li;
    }),
  );
}

/**
 * THE render function. One entry point, called on every state change, for every page.
 *
 * One more region than last week and not one line of new plumbing: each returns
 * immediately when its mount is absent, so the detail page and the summary page are
 * unaffected by a search panel they do not have.
 *
 * IT IS STILL SYNCHRONOUS AND IT IS STILL CALLED THE SAME WAY. Nothing about adding a
 * network changed how the screen is produced — which is worth saying out loud, because
 * "I need to await something in render" is the first instinct and it is always the
 * wrong one. The waiting happened in events.js; by the time this runs, the answer is
 * in `state` and it is as ordinary as everything else there.
 */
export function render(state) {
  renderFilters(state);
  renderList(state);
  renderFormMode(state);
  renderStorageNote(state);
  renderSearch(state);
  renderDetail(state);
  renderSummary(state);
}
