function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function isItem(value) {
    if (!isRecord(value))
        return false;
    if (typeof value.id !== 'string' || value.id === '')
        return false;
    if (typeof value.title !== 'string')
        return false;
    return typeof value.created === 'string';
}
export function summarise(items) {
    const total = items.length;
    const newest = items.reduce((best, item) => (best === null || item.created > best ? item.created : best), null);
    return { total, newest };
}
