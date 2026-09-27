// storage.js — saves the library in localStorage so it survives a reload
import { setState } from './state.js';

const KEY = 'books';

// Load the saved books (or null if nothing was saved yet)
export function load() {
  return JSON.parse(localStorage.getItem(KEY));
}

// Save the books, and record when we saved so the UI can show it
export function persist(state) {
  localStorage.setItem(KEY, JSON.stringify(state.books));
  setState({ savedAt: new Date().toISOString() });
}
