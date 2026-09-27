// The Tool Shelf. Loaded as a module, so it runs after the markup exists.
import { TOOLS } from './tools.js';

// The one copy of the truth: a copy of the seed, so tools.js stays what it was.
// `let`, because cycle 3 replaces it with a filtered copy.
let tools = TOOLS.map((tool) => ({ ...tool }));
let nextId = tools.length + 1;

const shelf = document.querySelector('#shelf');
const count = document.querySelector('#count');
const empty = document.querySelector('#empty');
const form = document.querySelector('#add-tool');
const nameField = document.querySelector('#tool-name');
const qtyField = document.querySelector('#tool-qty');
const error = document.querySelector('#tool-error');
const newTool = document.querySelector('[data-key="n"]');

/** Build one row and return it. Nothing is on the page until somebody appends it. */
function toolRow(tool) {
  const li = document.createElement('li');
  li.dataset.id = tool.id;

  const name = document.createElement('span');
  name.className = 'tool-name';
  name.textContent = tool.name;

  const qty = document.createElement('span');
  qty.className = 'tool-qty';
  qty.textContent = tool.qty;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.dataset.action = 'remove';
  remove.setAttribute('aria-label', `Remove ${tool.name}`);
  const label = document.createElement('span'); // so a click usually lands on the span, not the button
  label.textContent = 'Remove';
  remove.append(label);

  li.append(name, qty, remove);
  return li;
}

/** Empty the mount, fill it from the array, and derive everything else from the array too. */
function render() {
  shelf.replaceChildren();
  for (const tool of tools) shelf.append(toolRow(tool));

  empty.hidden = TOOLS.length > 0;
  count.textContent = tools.length;
}

form.addEventListener('submit', (event) => {
  // First line, always: without it the browser sends the form and reloads the page.
  event.preventDefault();

  const name = nameField.value.trim();
  const qty = Number(qtyField.value); // a string until here; a number from here on

  if (name.length < 2) {
    error.textContent = 'A tool name needs at least two characters.'; // what is wrong
    nameField.setAttribute('aria-invalid', 'true'); // which field
    nameField.focus(); // where to type
    return;
  }
  nameField.setAttribute('aria-invalid', 'false'); // and clear it when it passes
  error.textContent = '';

  tools.push({ id: `t${nextId}`, name, qty });
  nextId += 1;
  form.reset();
  nameField.focus();
  render();
});

// The "New tool" button puts the cursor in the form, and lights up for a moment so you see what ran.
newTool.addEventListener('click', () => {
  nameField.focus();
  newTool.classList.add('is-pressed');
  // A function, run once, later: at least 150 ms from now.
  setTimeout(() => newTool.classList.remove('is-pressed'), 150);
});

// One keydown listener for every shortcut on the page: a key does exactly what its button does.
document.addEventListener('keydown', (event) => {
  // Typing in a field is typing, not a shortcut.
  if (event.target.matches('input, textarea, select')) return;

  const button = [...document.querySelectorAll('[data-key]')].find(
    (candidate) => candidate.dataset.key === event.key,
  );
  if (!button) return;
  event.preventDefault();
  button.click();
});

// ONE listener for every Remove button that will ever exist, on the list, which
// render() empties but never replaces.
shelf.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="remove"]');
  if (!button) return; // the click was not on a Remove button

  const id = button.closest('li').dataset.id;
  tools = tools.filter((tool) => tool.id !== id); // change the data...
  render(); // ...and draw from it. The handler never touches a row itself.
});

render();
