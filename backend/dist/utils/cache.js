"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiCache = exports.SimpleCache = void 0;
class SimpleCache {
    constructor() {
        this.cache = new Map();
    }
    set(key, data, ttlSeconds) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + (ttlSeconds * 1000)
        });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    clear() {
        this.cache.clear();
    }
}
exports.SimpleCache = SimpleCache;
exports.apiCache = new SimpleCache();
