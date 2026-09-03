/**
 * summary.js — the summary page's numbers.
 *
 * GIVEN, IT WORKS, AND PART ג DELETES IT.
 *
 * Read it once before you do, because what is wrong with it is not visible in it.
 * Every line here is correct. It imports the same array the list page imports and it
 * counts honestly. The problem is that COUNTING HAPPENS IN TWO PLACES: this file, and
 * whatever the list page does for `#count`. Two functions that agree today are not one
 * function — they are a bug waiting for somebody to change one of them.
 *
 * There is also a second thing it cannot do, and you can see this one: add an item on
 * the list page, then come here. It says six. It will say six forever, because this
 * page reads the seed array and the list page's additions never reached it.
 */
import { SEED_ITEMS } from './items.js';

document.querySelector('#summary-count').textContent = SEED_ITEMS.length;

const totalQuantity = SEED_ITEMS.reduce((sum, item) => sum + item.number, 0);
document.querySelector('#summary-extra').textContent = totalQuantity;
