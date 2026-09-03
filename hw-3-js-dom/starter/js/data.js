/**
 * The data, and one helper. GIVEN — you do not change this file.
 *
 * Both halves of the application are driven from these two arrays. That is the point of
 * them: seven pads and six dice faces are DATA, and the page is built from the data.
 * Nothing in `index.html` mentions a tom or a five.
 */

/** The seven drum pads, in the order they appear on screen. */
export const PADS = [
  { key: 'w', label: 'Tom 1', image: 'images/tom1.png', sound: 'sounds/tom-1.mp3' },
  { key: 'a', label: 'Tom 2', image: 'images/tom2.png', sound: 'sounds/tom-2.mp3' },
  { key: 's', label: 'Tom 3', image: 'images/tom3.png', sound: 'sounds/tom-3.mp3' },
  { key: 'd', label: 'Tom 4', image: 'images/tom4.png', sound: 'sounds/tom-4.mp3' },
  { key: 'j', label: 'Snare', image: 'images/snare.png', sound: 'sounds/snare.mp3' },
  { key: 'k', label: 'Crash', image: 'images/crash.png', sound: 'sounds/crash.mp3' },
  { key: 'l', label: 'Kick', image: 'images/kick.png', sound: 'sounds/kick-bass.mp3' },
];

/** Face 1 is at index 0. `DICE_FACES[value - 1]` is the picture for `value`. */
export const DICE_FACES = [
  'images/dice1.png',
  'images/dice2.png',
  'images/dice3.png',
  'images/dice4.png',
  'images/dice5.png',
  'images/dice6.png',
];

/**
 * Play a sound once, from the start.
 *
 * GIVEN, and the last line needs a word of explanation. `play()` hands back a promise,
 * and a browser is allowed to REFUSE to play audio — for example before the user has
 * interacted with the page at all. A refusal you ignore becomes a red "Uncaught (in
 * promise)" in the console, on a page where nothing is actually wrong.
 *
 * Promises are week 11. Today, all you need to know is that `.catch()` is what says
 * "if the browser refuses, that is fine, carry on".
 *
 * @param {string} src path to an mp3
 */
export function playSound(src) {
  const audio = new Audio(src);
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

/** A whole number from 1 to 6, inclusive. */
export function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}
