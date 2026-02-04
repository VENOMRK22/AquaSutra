type CacheEntry<T> = {
    data: T;
    expiry: number;
}

export class SimpleCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    set(key: string, data: any, ttlSeconds: number) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + (ttlSeconds * 1000)
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        return entry.data as T;
    }

    clear() {
        this.cache.clear();
    }
}

export const apiCache = new SimpleCache();
