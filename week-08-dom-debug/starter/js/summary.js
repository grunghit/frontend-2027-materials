/**
 * summary.js — the summary page's two numbers.
 *
 * GIVEN AS AN EXAMPLE, and the second one is yours to write.
 *
 * The point of this file is what it does NOT contain: a number. Both readouts are
 * counted from `SEED_ITEMS`, which is the same module the list page reads, so the two
 * pages cannot drift apart. A summary page that stores its own totals is the first
 * place a project starts lying.
 */
import { SEED_ITEMS } from './items.js';

document.querySelector('#summary-count').textContent = SEED_ITEMS.length;

// CODE HERE — a second measure of your own, computed from SEED_ITEMS.
// Examples: the highest `number`, the average, how many are above some threshold.
