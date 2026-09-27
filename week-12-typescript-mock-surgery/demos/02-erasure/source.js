function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function isEntry(value) {
    if (!isRecord(value))
        return false;
    return (typeof value.id === 'string' &&
        typeof value.title === 'string' &&
        typeof value.added === 'string');
}
export function latest(entries) {
    const total = entries.length;
    const newest = entries.reduce((best, entry) => (best === null || entry.added > best ? entry.added : best), null);
    return { total, newest };
}
