// Everything in this file that describes a type is gone after compilation.
// (The class lending library's types — cycle 1 types a longer version of this file.)
export type LookupKind = 'offline' | 'status' | 'shape';

export interface ShelfEntry {
  readonly id: string;
  title: string;
  added: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isEntry(value: unknown): value is ShelfEntry {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.added === 'string'
  );
}

export function latest(entries: readonly ShelfEntry[]): { total: number; newest: string | null } {
  const total = entries.length;
  const newest = entries.reduce<string | null>(
    (best, entry) => (best === null || entry.added > best ? entry.added : best),
    null,
  );
  return { total, newest };
}
