/*
 * types.ts — every shape this app passes around, and the checks that still run after
 * compiling. Written FIRST: everything else returns something described here.
 */

/** One book in the catalogue. `year` is there and may hold nothing. */
export interface Book {
  readonly id: string;
  title: string;
  author: string;
  year: number | null;
  pages: number;
}

/** One saved entry on the shelf. `added` is an ISO date string, never a Date. */
export interface ShelfEntry {
  readonly id: string;
  title: string;
  added: string;
}

/** Why the catalogue did not load. A union: it cannot be written as an interface. */
export type LookupKind = 'offline' | 'status' | 'shape';

/** An object with string keys — and not null, and not an array. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The guard. Types are gone after compiling; this is still there, because what is in
 * localStorage was written by an earlier version of the app and nobody checked it.
 */
export function isEntry(value: unknown): value is ShelfEntry {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.added === 'string'
  );
}
