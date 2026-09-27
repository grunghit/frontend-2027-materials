/*
 * app.js — the entry point. It wires the four layers together, once.
 *
 *   1. hydrate    disk   -> state, BEFORE anybody listens (or it writes straight back)
 *   2. subscribe  state  -> screen, on every change
 *   3. subscribe  state  -> disk, on every change — the whole wiring of persistence
 *   4. wire       screen -> state, through handlers that only call setState
 *   5. render     draw once, because subscribing does not draw
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
