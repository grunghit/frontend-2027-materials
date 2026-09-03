/*
 * ============================================================================
 * app.js — the entry point. GIVEN, except for two lines.
 *
 * ── LOOK AT HOW SMALL TODAY'S CHANGE IS
 *
 * This is week 9's file. The whole of persistence is ONE NEW MODULE and TWO EDITS
 * here:
 *
 *     week 9                          today
 *     hydrate(SEED_ITEMS)             hydrate(<what came off disk> ?? SEED_ITEMS)
 *     subscribe(render)               subscribe(render)
 *                                     subscribe(<the storage subscriber>)
 *     wire()                          wire()
 *     render(getState())              render(getState())
 *
 * `render.js` will not learn that anything is saved. `events.js` will not learn it.
 * `state.js` will not learn it. If you find yourself editing a handler today to make
 * it save something, stop — that is the answer this shape exists to make unnecessary,
 * and it is worth points.
 *
 * ── THE ORDER, AND WHY IT IS THIS ORDER
 *
 *   1. hydrate(...)          read disk, fall back to the seed — BEFORE anybody is
 *                            subscribed, so this does not immediately write back what
 *                            it just read
 *   2. subscribe(render)     the screen follows every change, from now on
 *   3. subscribe(persist)    and so does the disk
 *   4. wire()                once, and never from inside render()
 *   5. render(getState())    STILL THE LINE PEOPLE FORGET. `subscribe` registers for
 *                            FUTURE changes, and nothing has changed yet.
 *
 * ── ONE ANSWER TO GET RIGHT ON LINE 1, AND IT IS NOT THE OPERATOR
 *
 * Use `??` rather than `||`: it falls back on ABSENCE, and `||` falls back on anything
 * falsy. Today the two behave identically here, because `[]` is truthy and `load`
 * returns an array or `null` — so this is a habit, not a bug you would hit.
 *
 * THE ONE THAT IS A BUG lives inside `load`, one level down: it has to return `[]` for
 * a collection that was SAVED EMPTY and `null` only when nothing was ever saved.
 * Report an empty collection as "nothing here" and a user who deleted everything gets
 * the demo data back on the next reload. You will not find it by testing, because you
 * have to clear everything and THEN reload, in that order.
 * ============================================================================
 */
import { SEED_ITEMS } from './items.js';
import { getState, hydrate, subscribe } from './state.js';
import { render } from './render.js';
import { wire } from './events.js';

// CODE HERE — import what you need from './storage.js'

hydrate(SEED_ITEMS); // CODE HERE — read from storage first, and fall back to the seed

subscribe(render);
// CODE HERE — one line. The disk follows every change, exactly as the screen does.
wire();
render(getState());
