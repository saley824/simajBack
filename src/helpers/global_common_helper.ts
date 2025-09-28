function getQueryNumber(query: Record<string, any>, key: string, defaultValue?: number): number | undefined {
    const value = query[key];
    if (value === undefined) return defaultValue;
    const n = Number(value);
    return isNaN(n) ? defaultValue : n;
}


export default {
    getQueryNumber,
};
