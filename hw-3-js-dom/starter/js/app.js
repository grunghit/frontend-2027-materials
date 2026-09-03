/**
 * app.js — home assignment 3. This is the only file you write.
 *
 * WHAT YOU ARE BUILDING
 *
 *   CORE       the seven pads, built from `PADS`; they respond to a click and to their
 *              key; two dice roll, the pictures change, the result is announced, and
 *              every roll joins a history that is drawn from an array.
 *   STRETCH    a delegated remove button on each round — including rounds added after
 *              the page loaded — and three statistics computed from the history.
 *   CHALLENGE  a settings form that renames the players without reloading the page,
 *              and refuses to accept an empty name in a way a person can act on.
 *
 * THE FOUR RULES IT IS MARKED AGAINST
 *
 *   1. `rounds` is the truth. What is on screen is drawn from it, always.
 *   2. Nothing is written into index.html by hand — not a pad, not a round.
 *   3. ONE listener for every remove button. Not one per button.
 *   4. `createElement` and `textContent`. No `innerHTML` anywhere in this file.
 *
 * Every `CODE HERE` is a place you write. Delete the marker when you are done.
 */
import { PADS, DICE_FACES, playSound, rollDie } from './data.js';

/** The one source of truth for the history. Each round: { id, one, two, winner } */
let rounds = [];

/** Never reuse an id, even for a round that was removed. */
let nextId = 1;

/** The two names. The settings form changes these; nothing else does. */
let players = { one: 'שחקן א', two: 'שחקן ב' };

const padsBox = document.querySelector('#pads');
const history = document.querySelector('#history');
const historyEmpty = document.querySelector('#history-empty');
const roundCount = document.querySelector('#round-count');
const result = document.querySelector('#result');
const dieOne = document.querySelector('#die-one');
const dieTwo = document.querySelector('#die-two');
const playersForm = document.querySelector('#players-form');
const playersError = document.querySelector('#players-error');

/* ── CORE · the drum kit ──────────────────────────────────────────────────── */

/**
 * Build the seven pads into `#pads`, one per entry of `PADS`.
 *
 * Each pad is a real `<button type="button">` — not a `<div>` — because a button is
 * reachable by Tab and activated by Enter and Space for free. Inside it:
 *
 *   <button type="button" class="pad" data-key="w">
 *     <img src="images/tom1.png" alt="" width="64" height="64">
 *     <span class="pad-key">w</span>
 *   </button>
 *
 * The image is decorative — the label beside it says what the pad is — so its `alt`
 * is deliberately empty. Give the button an `aria-label` with the real name instead.
 */
function buildPads() {
  // CODE HERE — build one button per pad and append them all to padsBox
}

/**
 * Strike a pad: play its sound, and mark it for a moment.
 *
 * @param {string} key one of the `key` values in PADS
 */
function hit(key) {
  // CODE HERE — find the pad in PADS, play its sound, add the 'hit' class,
  //             and remove that class again after about 150ms
}

/* ── CORE · the dice ──────────────────────────────────────────────────────── */

/**
 * Roll both dice: change the two pictures, announce who won, and record the round.
 *
 * `DICE_FACES[value - 1]` is the picture for `value`. Remember that the array starts
 * at 0 and a die starts at 1 — this is the off-by-one the whole exercise is built on.
 */
function roll() {
  // CODE HERE — roll two dice, update both <img> src values, decide the winner,
  //             push a round onto `rounds`, and call render()
}

/* ── CORE · the history ───────────────────────────────────────────────────── */

/**
 * Build ONE history row and return it, unattached.
 *
 *   <li data-id="1">
 *     <span class="round-text">…</span>
 *     <button type="button" class="remove"><span>הסר</span></button>
 *   </li>
 *
 * The `<span>` inside the button is not decoration: it is there so that the click you
 * have to handle lands on something that is NOT the button.
 *
 * @param {{ id: number, one: number, two: number, winner: string }} round
 */
function roundRow(round) {
  // CODE HERE — build and return the <li>
}

/** Draw everything that depends on `rounds`: the rows, the empty state, the counter. */
function render() {
  // CODE HERE — empty #history, build a row per round, show or hide #history-empty,
  //             set #round-count, and call renderStats()
}

/* ── STRETCH · the statistics ─────────────────────────────────────────────── */

/**
 * Three numbers, all computed from `rounds` — never counted up as you go.
 *
 *   #wins-one   how many rounds player one won
 *   #wins-two   how many rounds player two won
 *   #best-roll  the highest single die value anyone has rolled, or — when empty
 *
 * A statistic you store is a second source of truth, and it will drift.
 */
function renderStats() {
  // CODE HERE — compute all three from `rounds` and write them to the page
}

/* ── CHALLENGE · the settings form ────────────────────────────────────────── */

/**
 * Rename the players.
 *
 * A submit that cannot be honoured has to say three things, and all three are marked:
 * a sentence in `#players-error` naming the rule, `aria-invalid="true"` on the field
 * that failed (and `"false"` on the one that is fine), and focus moved into it.
 *
 * A name is acceptable when it has at least two characters after `trim()`.
 */
function onPlayersSubmit(event) {
  // CODE HERE — stop the page reloading, validate, report, and on success update
  //             `players`, the two <figcaption> elements, and re-render
}

/* ── The events ───────────────────────────────────────────────────────────── */
/*
 * Five listeners. Not more.
 *
 *   · click on #pads          — delegated. The pads do not exist when this runs.
 *   · keydown on document     — the key is `event.key`, and it is lower case here.
 *   · click on #roll
 *   · click on #history       — delegated, for the remove buttons.
 *   · submit on #players-form
 *
 * For the two delegated ones, `event.target` is usually an element INSIDE the button.
 */

// CODE HERE — the five listeners

buildPads();
render();
