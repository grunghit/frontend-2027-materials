// The Tool Shelf. Loaded as a module, so it runs after the markup exists.
import { TOOLS } from './tools.js';

// The one copy of the truth: a copy of the seed, so tools.js stays what it was.
// `let`, because cycle 3 replaces it with a filtered copy.
let tools = TOOLS.map((tool) => ({ ...tool }));

const shelf = document.querySelector('#shelf');
const count = document.querySelector('#count');
const empty = document.querySelector('#empty');

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

  li.append(name, qty);
  return li;
}

/** Empty the mount, fill it from the array, and derive everything else from the array too. */
function render() {
  shelf.replaceChildren();
  for (const tool of tools) shelf.append(toolRow(tool));

  empty.hidden = tools.length > 0;
  count.textContent = tools.length;
}

render();
