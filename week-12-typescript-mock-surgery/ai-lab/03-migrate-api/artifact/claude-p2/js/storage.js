/*
 * storage.ts — the shelf, on the disk.
 *
 * What is in localStorage was written by an EARLIER version of this app, or by somebody
 * with the console open. So nothing that comes out of it is trusted until it is checked.
 */
import { isEntry } from './types.js';
const KEY = 'library-shelf:v1';
export function load() {
    const raw = localStorage.getItem(KEY);
    if (raw === null)
        return { entries: [], skipped: 0 };
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return { entries: [], skipped: 0 };
    }
    if (!Array.isArray(parsed))
        return { entries: [], skipped: 0 };
    const entries = parsed.filter(isEntry);
    return { entries, skipped: parsed.length - entries.length };
}
export function save(entries) {
    localStorage.setItem(KEY, JSON.stringify(entries));
}
