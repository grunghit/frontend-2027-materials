/*
 * ============================================================================
 * app.js — the entry point. It wires the five layers together and gets out of the way.
 *
 * ── THE WHOLE OF LAST WEEK WAS FIVE LINES HERE. THE WHOLE OF THIS WEEK IS ZERO.
 *
 * Put this file beside week 10's. It is IDENTICAL. Not "nearly" — identical.
 *
 *     week 10                         week 11
 *     hydrate(load() ?? SEED_ITEMS)   hydrate(load() ?? SEED_ITEMS)
 *     subscribe(render)               subscribe(render)
 *     subscribe(persist)              subscribe(persist)
 *     wire()                          wire()
 *     render(getState())              render(getState())
 *
 * A whole network layer was added — a request that can be slow, cancelled, refused or
 * absent — and the file that wires the application together did not change, because
 * there was nothing new to wire. `api.js` is not a SUBSCRIBER: nothing happens to it
 * when the state changes. It is a service that `events.js` calls when the user asks a
 * question, so it joins the application at the point where questions are asked.
 *
 * ── AND THE FILE THAT DID NOT GET OPENED THIS WEEK IS `js/storage.js`
 *
 * An item added from the catalogue is on disk. Nobody wrote a line to put it there: the
 * handler that adds it calls `setState`, `persist` is subscribed to `setState`, and
 * `persist` was written last week by somebody who had never heard of an API. That is
 * the second time this argument has paid, and it is the one to point at when a student
 * asks why the layers are worth the trouble.
 *
 * ── ONE THING TO LOOK FOR, AND IT IS AN ABSENCE
 *
 * There is no `await` in this file and no `async` on anything it calls at boot. THE
 * PAGE DRAWS BEFORE THE NETWORK IS TOUCHED, always — nothing here asks anybody
 * anything. An application whose first paint waits on a request is an application that
 * shows a white rectangle on a bad connection and nothing at all on no connection, and
 * that is a choice made right here, in the order of five lines.
 *
 * ── THE ORDER, AND WHY IT IS STILL THIS ORDER
 *
 *   1. hydrate(load() ?? SEED_ITEMS)   disk first, seed if there is nothing — BEFORE
 *                                      anybody is subscribed, so this does not
 *                                      immediately write back what it just read.
 *   2. subscribe(render)               the screen follows every change.
 *   3. subscribe(persist)              and so does the disk.
 *   4. wire()                          once, and never from inside render().
 *   5. render(getState())              STILL THE LINE PEOPLE FORGET. `subscribe`
 *                                      registers for FUTURE changes, and nothing has
 *                                      changed yet.
 *
 * ALL THREE PAGES LOAD THIS SAME FILE. render(state) skips any region whose mount is
 * absent and wire() skips any control that is not there — so the search panel exists on
 * the list page and nowhere else, and neither of the other two had to be told.
 * ============================================================================
 */
import { SEED_ITEMS } from './items.js';
import { getState, hydrate, subscribe } from './state.js';
import { load, persist } from './storage.js';
import { render } from './render.js';
import { wire } from './events.js';

hydrate(load() ?? SEED_ITEMS);

subscribe(render);
subscribe(persist);
wire();
render(getState());
