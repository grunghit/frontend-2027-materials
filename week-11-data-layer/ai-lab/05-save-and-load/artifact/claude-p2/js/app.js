/*
 * app.js — the entry point. Disk first, before anybody listens; then the screen and the
 * disk both follow every change. (P2's answer.)
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
