class LRUCache {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.cache = new Map();
        this.currentSize = 0;
    }

    get(key) {
        if (!this.cache.has(key)) return undefined;

        // Move to front (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            this.currentSize -= this._getItemSize(this.cache.get(key));
            this.cache.delete(key);
        }

        const newItemSize = this._getItemSize(value);

        // If the new item is larger than the maximum size, don't add it
        if (newItemSize > this.maxSize) {
            throw new Error('Item size exceeds maximum cache size');
        }

        // Evict items if necessary, considering priority
        while (this.currentSize + newItemSize > this.maxSize && this.cache.size > 0) {
            this._evictItem();
        }

        this.cache.set(key, value);
        this.currentSize += newItemSize;
    }

    has(key) {
        return this.cache.has(key);
    }

    delete(key) {
        if (this.cache.has(key)) {
            this.currentSize -= this._getItemSize(this.cache.get(key));
            return this.cache.delete(key);
        }
        return false;
    }

    clear() {
        this.cache.clear();
        this.currentSize = 0;
    }

    get size() {
        return this.currentSize;
    }

    _getItemSize(item) {
        return Buffer.from(JSON.stringify(item)).length;
    }

    _evictItem() {
        // Find the item with the lowest priority
        let lowestPriority = Infinity;
        let keyToEvict = null;

        for (const [key, item] of this.cache) {
            const priority = item.metadata?.priority || Infinity; // Default to highest priority if no metadata
            if (priority <= lowestPriority) {
                lowestPriority = priority;
                keyToEvict = key;
            }
        }

        if (keyToEvict) {
            this.currentSize -= this._getItemSize(this.cache.get(keyToEvict));
            this.cache.delete(keyToEvict);
        }
    }
}

module.exports = LRUCache;