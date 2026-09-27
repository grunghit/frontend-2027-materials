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

function render() {
  queue.innerHTML = talks
    .map((talk) => `<li>${talk.title} <span class="mins">${talk.minutes} min</span></li>`)
    .join('');
}

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
