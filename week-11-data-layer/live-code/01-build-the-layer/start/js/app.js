/*
 * app.js — the entry point. It wires the three layers together, once.
 * This is week 10's file, and a reload still throws everything away.
 */
import { BOOKS } from './data.js';
import { getState, seed, subscribe } from './state.js';
import { render } from './render.js';
import { wire } from './events.js';

seed(BOOKS);
subscribe(render);
wire();
render(getState());
