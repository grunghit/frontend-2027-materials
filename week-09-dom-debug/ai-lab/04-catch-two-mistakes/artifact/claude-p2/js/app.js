// Watch later: a list of talks, and a form that adds one.
const queue = document.querySelector('#queue');
const form = document.querySelector('#add-talk');
const titleField = document.querySelector('#talk-title');
const minutesField = document.querySelector('#talk-minutes');

let talks = [
  { id: 1, title: 'How browsers paint a page', minutes: 18 },
  { id: 2, title: 'CSS Grid in twenty minutes', minutes: 20 },
  { id: 3, title: 'Events, bubbling and delegation', minutes: 25 },
];
let nextId = 4;

// Build one row. The title comes from the form, so it is only ever set as text.
function talkRow(talk) {
  const li = document.createElement('li');
  li.dataset.id = String(talk.id);

  const title = document.createElement('span');
  title.textContent = talk.title;

  const mins = document.createElement('span');
  mins.className = 'mins';
  mins.textContent = `${talk.minutes} min`;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-btn';
  remove.textContent = 'Remove';
  remove.setAttribute('aria-label', `Remove ${talk.title}`);

  li.append(title, mins, remove);
  return li;
}

function render() {
  queue.replaceChildren(...talks.map(talkRow));
}

// One listener for every Remove button, registered once, on the list itself.
// render() replaces the list's children, never the list.
queue.addEventListener('click', (event) => {
  const button = event.target.closest('.remove-btn');
  if (!button) return;

  const id = Number(button.closest('li').dataset.id);
  talks = talks.filter((talk) => talk.id !== id);
  render();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleField.value.trim();
  if (!title) return;
  talks.push({ id: nextId, title, minutes: Number(minutesField.value) || 0 });
  nextId += 1;
  form.reset();
  render();
});

render();
