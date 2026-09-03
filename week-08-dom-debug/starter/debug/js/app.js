/**
 * רשימת מוזמנים — the Debug Challenge application.
 *
 * WHAT IT IS SUPPOSED TO DO
 *
 *   1. Show every guest. The first MAX_SEATED of them are at the main table; everyone
 *      after that is on the waiting list. No guest is ever in neither list.
 *   2. The form adds a guest with a name and a number of seats, and clears itself.
 *   3. The "מוזמנים" readout is how many guests there are, "סך המקומות" is the sum of
 *      their seats, and "אישרו הגעה" is how many have ticked their box.
 *   4. Ticking a guest's box marks them as confirmed and updates that readout.
 *   5. The "הסר" button removes that guest.
 *
 * It does none of those five things correctly. Five faults are planted below, of five
 * different kinds, and every one of them is a mistake people really make. Nothing here
 * is a typo in a keyword, nothing is a syntax error, and the HTML and the CSS are fine.
 *
 * Work the method: reproduce, isolate, hypothesise, verify, fix, confirm.
 */
import { SEED_GUESTS, MAX_SEATED } from './guests.js';

/** The one source of truth. Everything on screen is drawn from this array. */
let guests = SEED_GUESTS.map((guest) => ({ ...guest }));

const form = document.querySelector('#guest-form');
const formError = document.querySelector('#form-error');
const seatedList = document.querySelector('#seated-list');
const waitingList = document.querySelector('#waiting-list');
const lists = document.querySelector('#lists');

let nextId = guests.length + 1;

/** Build one row. */
function guestRow(guest) {
  const li = document.createElement('li');
  li.dataset.id = guest.id;
  if (guest.confirmed) li.classList.add('confirmed');

  const label = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'confirm';
  box.checked = guest.confirmed;
  box.dataset.id = guest.id;
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = guest.name;
  label.append(box, name);

  const seats = document.createElement('span');
  seats.className = 'seats';
  seats.textContent = `${guest.seats} מקומות`;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove';
  remove.dataset.id = guest.id;
  const removeText = document.createElement('span');
  removeText.textContent = 'הסר';
  remove.append(removeText);

  li.append(label, seats, remove);
  return li;
}

/** Draw a list, or an empty state if there is nothing in it. */
function fillList(element, rows, emptyText) {
  element.replaceChildren();
  if (rows.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = emptyText;
    element.append(p);
    return;
  }
  for (const guest of rows) element.append(guestRow(guest));
}

function renderTotals() {
  const totalSeats = guests.reduce((sum, guest) => sum + guest.seats, 0);
  document.querySelector('#seats-total').textContent = totalSeats;

  const confirmed = guests.filter((guest) => guest.confirmed).length;
  document.querySelector('#confirmed-count').textContent = confirmed;
}

function updateGuestCount() {
  document.querySelector('#guests-count').textContent = guests.length;
}

function render() {
  const seated = guests.slice(0, MAX_SEATED);
  const waiting = guests.slice(MAX_SEATED + 1);

  fillList(seatedList, seated, 'אין עדיין אף מוזמן.');
  fillList(waitingList, waiting, 'אין אף אחד בהמתנה.');

  renderTotals();
  updateGuestCount();
}

function onConfirmChange(event) {
  const id = event.target.dataset.id;
  const guest = guests.find((candidate) => candidate.id === id);
  if (!guest) return;
  guest.confirmed = event.target.checked;
  render();
}

for (const box of document.querySelectorAll('.confirm')) {
  box.addEventListener('change', onConfirmChange);
}

lists.addEventListener('click', (event) => {
  if (!event.target.classList.contains('remove')) return;
  const id = event.target.dataset.id;
  guests = guests.filter((guest) => guest.id !== id);
  render();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = form.name.value.trim();
  const seats = form.seats.value;

  if (name === '') {
    formError.textContent = 'צריך שם.';
    form.name.setAttribute('aria-invalid', 'true');
    form.name.focus();
    return;
  }

  formError.textContent = '';
  form.name.setAttribute('aria-invalid', 'false');

  guests.push({ id: `g${nextId}`, name, seats, confirmed: false });
  nextId += 1;

  form.reset();
  form.name.focus();
  render();
});

render();
