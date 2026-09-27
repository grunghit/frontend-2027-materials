/*
 * app.js — the entry point. It wires the three layers together, once.
 *
 *   1. seed        data   -> state
 *   2. subscribe   state  -> screen, on every change, from now on
 *   3. wire        screen -> state, through handlers that only call setState
 *   4. render      draw once, because subscribing does not draw
 */
import { BOOKS } from './data.js';
import { getState, seed, subscribe } from './state.js';
import { render } from './render.js';
import { wire } from './events.js';

seed(BOOKS);
subscribe(render);
wire();
render(getState());
