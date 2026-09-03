/*
 * ============================================================================
 * events.js — LAYER 3 OF 3. The user acts. This file translates the act into a
 * change of state, and then stops.
 *
 * THE ONE RULE THIS FILE OBEYS: a handler describes WHAT IS NOW TRUE. It never
 * describes what the screen should look like afterwards. Not one line in this file
 * builds an element, sets textContent, moves a node or hides anything — and if you
 * find yourself writing one, the change belongs in render.js and the handler belongs
 * to be two lines shorter.
 *
 * That rule is what makes every future change local. "Show the shelf on each row" is
 * a change to render.js alone. "Search the shelf name too" is a change to state.js
 * alone. Neither of them is a change here, and in js/app.js both would have been.
 *
 * WHY EVERY LISTENER IS ON A CONTAINER. render() empties #list and refills it on
 * every single change, so a listener registered on a row dies with the row. It is
 * registered on the <ul>, which render() empties but never replaces, and it finds
 * what was clicked with `closest`. This is week 8's delegation, and this week is the
 * week it stops being optional: before today, re-rendering was something you chose
 * to do; from today it happens on every keystroke.
 *
 * `wire()` is called ONCE, by js/app.js, at boot. Never from render().
 * ============================================================================
 */
import { getState, setState } from './state.js';

/**
 * Read the add form, or say what is wrong with it.
 *
 * Moved from js/app.js unchanged apart from one thing: it no longer pushes anything
 * anywhere. It returns an item or null, and the caller decides.
 */
function readForm() {
  // CODE HERE — move readForm() and fail() over from js/app.js.
  return null;
}

/**
 * Register every listener. Called once.
 *
 * GIVEN: the shape and the delegation. Yours: what each handler puts in the patch.
 */
export function wire() {
  const form = document.querySelector('#item-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const item = readForm();
      if (item === null) return;

      // CODE HERE — the new collection is the old one plus this item. Commit it,
      //             then reset the form and put the cursor back in the first field.
      //
      //             `[...getState().items, item]` — a NEW array. `push` mutates the
      //             array that is already in state, and setState would then be handed
      //             the object it already has. Everything still works today and it is
      //             the habit that breaks the moment anything compares old to new.
    });
  }

  const queryField = document.querySelector('#query');
  if (queryField) {
    queryField.addEventListener('input', () => {
      // CODE HERE — one line. What the user typed is now true.
    });
  }

  const categorySelect = document.querySelector('#category');
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      // CODE HERE — one line.
    });
  }

  const sortSelect = document.querySelector('#sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      // CODE HERE — one line. Note what it does NOT do: it does not sort anything.
      //             Sorting is a derivation, and derivations live in state.js.
    });
  }

  /*
   * ONE listener for every row button that will ever exist, on the <ul> — which
   * render() empties but never replaces.
   *
   * `closest` rather than a check against `event.target`: the click lands on the
   * <span> inside the button most of the time, and a check against the target alone
   * works only when the user happens to hit the padding. That is the worst kind of
   * bug — it works when you test it.
   */
  const list = document.querySelector('#list');
  if (list) {
    list.addEventListener('click', (event) => {
      const row = event.target.closest('li[data-id]');
      if (!row) return;
      const id = row.dataset.id;

      if (event.target.closest('button.plus')) {
        // CODE HERE — a new array in which the item with this id has one more, and
        //             every other item is the object it already was. `.map` returns
        //             exactly that.
        return;
      }

      if (event.target.closest('button.remove')) {
        // CODE HERE — a new array without this id.
        //
        //             For the challenge tier: remember the array you are replacing,
        //             so undo is "put that one back" rather than "reconstruct what
        //             the user had". That is the whole reason undo is cheap here.
      }
    });
  }

  /* The undo button (part ד). It is not inside #list, so it needs its own
     container — and #undo is emptied and refilled by render() exactly like #list. */
  const undoMount = document.querySelector('#undo');
  if (undoMount) {
    undoMount.addEventListener('click', (event) => {
      if (!event.target.closest('[data-action="undo"]')) return;
      // CODE HERE
    });
  }
}
