// Everything in this file that describes a type is gone after compilation.
export type LoadState = 'idle' | 'loading' | 'error' | 'done';

export interface Item {
  id: string;
  title: string;
  created: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isItem(value: unknown): value is Item {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || value.id === '') return false;
  if (typeof value.title !== 'string') return false;
  return typeof value.created === 'string';
}

export function summarise(items: readonly Item[]): { total: number; newest: string | null } {
  const total = items.length;
  const newest = items.reduce<string | null>(
    (best, item) => (best === null || item.created > best ? item.created : best),
    null,
  );
  return { total, newest };
}
