/*
 * ============================================================================
 * render.js — LAYER 2 OF 3. State goes in. The screen comes out.
 *
 * THE ONE RULE THIS FILE OBEYS: it is a function of its argument and of nothing
 * else. Give it the same state twice and it draws the same screen twice. That is
 * what makes it possible to answer "why does the screen say that?" by looking at one
 * object instead of by replaying every click since the page loaded.
 *
 * What this file may NOT do, and each of these has a reason:
 *
 *   · CHANGE STATE. A render that also changes something can call itself, and a
 *     screen that redraws forever is a bug you debug with the tab already frozen.
 *   · REGISTER EVENT LISTENERS. render() runs on every change; a listener added
 *     inside it is added again on every change. Listeners live in events.js and are
 *     registered exactly once, on a container.
 *   · READ THE DOM TO DECIDE WHAT TO DRAW. If the answer is on screen already, the
 *     screen is the source of truth and law 1 is gone. The state is the answer.
 *
 * IT DOES NOT KNOW WHICH PAGE IT IS ON. Every region renderer below returns
 * immediately when its mount element is absent, which is why one entry point serves
 * index.html, item.html and summary.html and why adding a fourth page changes
 * nothing in js/app.js.
 * ============================================================================
 */
import { selectCategories, selectOne, selectSummary, selectVisible } from './state.js';

/**
 * Build ONE row and return it, unattached — a COMPONENT: item in, element out, no
 * side effects, no knowledge of where it will be put.
 *
 * `data-id`, not `data-index`. The row's position changes every time somebody sorts,
 * searches or filters; its identity does not. That is fault 3 in js/app.js.
 *
 * `createElement` and `textContent` throughout, as in week 9: the titles arrive from
 * a form, and a string a user typed is exactly the one that must never reach the HTML
 * parser.
 *
 * @param {{ id: string, title: string, number: number, category: string }} item
 * @returns {HTMLLIElement}
 */
export function itemRow(item) {
  // CODE HERE — move this over from js/app.js and change the one line that records
  //             the row's identity. Keep the class names: the grader, your CI and
  //             your own stylesheet all look for them.
  return document.createElement('li');
}

/** The list page's list, its counter and its empty state. */
function renderList(state) {
  const list = document.querySelector('#list');
  if (!list) return;

  // CODE HERE — draw selectVisible(state), set #count, and decide #empty.
  //
  //             #empty is not one state, it is two, and the sentence has to say
  //             which: "there is nothing here yet" and "nothing matched what you
  //             typed" send the user to two different places. Week 7, the four states.
}

/** The list page's shelf filter, whose options are derived. */
function renderFilters(state) {
  const select = document.querySelector('#category');
  if (!select) return;

  // CODE HERE — rebuild the <option>s from selectCategories(state), keeping the
  //             "all" option first.
  //
  //             ONE EXCEPTION TO "REDRAW EVERYTHING", AND IT IS THE ONLY ONE IN THIS
  //             FILE: a <select> the user is standing in must keep its value. Read
  //             select.value before you rebuild and put it back afterwards, or the
  //             control resets itself on every keystroke somebody types in the search
  //             box — which is a bug the mouse never finds.
}

/** The detail page (part ג). */
function renderDetail(state) {
  const mount = document.querySelector('#detail');
  if (!mount) return;

  const id = new URLSearchParams(location.search).get('id');
  // CODE HERE — selectOne(state, id), then either the item or the empty state.
}

/** The summary page (part ג). */
function renderSummary(state) {
  const total = document.querySelector('#summary-count');
  if (!total) return;

  // CODE HERE — selectSummary(state) into #summary-count, #summary-extra and
  //             #summary-shelves.
}

/** The undo offer (part ד). */
function renderUndo(state) {
  const mount = document.querySelector('#undo');
  if (!mount) return;

  // CODE HERE — nothing when there is nothing to undo; a sentence and a button with
  //             data-action="undo" when there is.
}

/**
 * THE render function. One entry point, called on every state change, for every page.
 *
 * GIVEN. If you need a new region, add a renderer above and one line here.
 */
export function render(state) {
  renderFilters(state);
  renderList(state);
  renderUndo(state);
  renderDetail(state);
  renderSummary(state);
}
