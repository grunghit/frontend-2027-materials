/*
 * ============================================================================
 * app.js — the entry point. It wires the five layers together and gets out of the way.
 * GIVEN, and identical in the starter and the solution: nothing you write this week
 * goes here.
 *
 * ── THE WHOLE OF THE DATA LAYER IS TWO LINES OF THIS FILE
 *
 * Put it beside the state week's (week 10):
 *
 *     week 10                         week 11
 *     seed(SEED_ITEMS)                hydrate(load())         ← what came off disk
 *     subscribe(render)               subscribe(render)
 *                                     subscribe(persist)      ← and the disk follows
 *     wire()                          wire()
 *     render(getState())              render(getState())
 *
 * `render.js` does not learn that anything is saved. `events.js` does not learn it.
 * `state.js` does not learn it. And a whole network layer — a request that can be slow,
 * cancelled, refused or absent — adds NOTHING here: `api.js` is not a subscriber,
 * nothing happens to it when the state changes. It is a service `events.js` calls when
 * the user asks a question.
 *
 * ── THE ORDER, AND WHY
 *
 *   1. hydrate(load())      disk first — BEFORE anybody is subscribed, so this does not
 *                           immediately write back what it just read. `load()` always
 *                           returns an array: an absent key is an EMPTY pantry, never
 *                           the demo data (the project's rule, and the exam's).
 *   2. subscribe(render)    the screen follows every change.
 *   3. subscribe(persist)   and so does the disk. The order between 2 and 3 does not
 *                           matter — neither reads the other.
 *   4. wire()               once, and never from inside render().
 *   5. render(getState())   STILL THE LINE PEOPLE FORGET. `subscribe` registers for
 *                           FUTURE changes, and nothing has changed yet.
 *
 * THERE IS NO `await` IN THIS FILE. The page draws before the network is touched —
 * always. A first paint that waits on a request is a white rectangle on a bad
 * connection and nothing at all on no connection.
 *
 * ALL THREE PAGES LOAD THIS SAME FILE. render(state) skips any region whose mount is
 * absent and wire() skips any control that is not there.
 * ============================================================================
 */
import { getState, hydrate, subscribe } from './state.js';
import { load, persist } from './storage.js';
import { render } from './render.js';
import { wire } from './events.js';

hydrate(load());

subscribe(render);
subscribe(persist);
wire();
render(getState());
