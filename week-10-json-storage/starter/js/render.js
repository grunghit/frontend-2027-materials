/*
 * ============================================================================
 * render.js — LAYER 2 OF 4. State goes in. The screen comes out.
 *
 * NOTHING IN THIS FILE WILL KNOW THAT ANYTHING IS BEING SAVED. When you are finished,
 * search it for `storage`, for `localStorage`, for `JSON` — there must be nothing to
 * find. It draws two new things today (the form's MODE, and a sentence when a write
 * FAILED), and both of them come out of the state object exactly as everything else
 * does. That is the return on last week: a whole new layer arrives and the painter is
 * never told.
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
  selectOne,
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

  /* CODE HERE — add the edit button to this list. `button.edit`, and an aria-label
     that names the item, exactly like the other two. It carries no state of its own:
     the delegated handler in events.js reads the row's `data-id`. */
  for (const [cls, label, aria] of [
    ['plus', '+1', `הוסף אחד ל${item.title}`],
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

  /* CODE HERE — the second argument. `itemRow` marks the row that is open in the
     form, and it can only do that if it is told which one that is. */
  list.replaceChildren(...visible.map((item) => itemRow(item)));
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

  /* CODE HERE — `#reset-demo` belongs to the FIRST of the two empty states only.
     Offering "restore the demo data" to somebody whose search matched nothing is
     offering to delete the collection they are searching. It ships `hidden`. */
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

  /* CODE HERE — three things, all derived from ONE nullable field:
       · what `#form-submit` says              — "הוסף" or "שמור"
       · whether `#form-cancel` is offered     — it ships `hidden`
       · a sentence in `#form-mode` naming what is being edited, or nothing

     Note what is NOT here, and must not be: the form's FIELDS. They are filled by
     events.js at the moment editing starts. `render` runs on every keystroke in the
     search box, and a field whose value is reassigned while somebody is typing in it
     is a field that fights the user. DATA IS DRAWN FROM STATE; A CONTROL'S OWN VALUE
     IS NOT. */
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

  /* CODE HERE — a sentence when the last write failed, and nothing at all when it did
     not. Two failures, two DIFFERENT sentences, because they need two different
     things from the user: one is "your browser is blocking this", the other is "there
     is no room and your last change is not saved".

     THIS ELEMENT IS THE WHOLE POINT OF WRAPPING EVERY ACCESS. A `catch {}` with an
     empty body gives the user an application that looks exactly like one that is
     saving and is not, and they find out when they close the tab. */
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
 * Two more regions than last week and not one line of new plumbing: each returns
 * immediately when its mount is absent, so the detail page and the summary page are
 * unaffected by a form mode they do not have. Adding a region is adding a function
 * and a line — which is the same claim app.js is about to make about adding a layer.
 */
export function render(state) {
  renderFilters(state);
  renderList(state);
  renderFormMode(state);
  renderStorageNote(state);
  renderDetail(state);
  renderSummary(state);
}
