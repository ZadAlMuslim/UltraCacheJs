const LRUCache = require('../utils/LRUCache');
const compression = require('../utils/compression');
const encryption = require('../utils/encryption');
const AIPredictor = require('../utils/AIPredictor');

class Cache {
    constructor(options) {
        this.options = options;
        this.storage = new LRUCache(this._parseSize(options.maxSize));
        this.aiPredictor = options.aiEnabled ? new AIPredictor() : null;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            aiPredictions: 0,
            accuracy: 0
        };
    }

    set(key, value, options = {}) {
        try {
            let processedValue = value;
            const metadata = {
                createdAt: Date.now(),
                ttl: options.ttl || this.options.ttl,
                originalSize: this._getSize(value),
                accessPattern: [],
                priority: options.priority || 0.5
            };

            // أولاً: تشفير البيانات إذا كان مطلوباً
            if (this.options.encryption) {
                processedValue = encryption.encrypt(processedValue);
            }

            // ثانياً: ضغط البيانات المشفرة إذا كان مطلوباً
            if (this.options.compression) {
                processedValue = compression.compress(processedValue);
            }

            const item = {
                value: processedValue,
                metadata,
                isEncrypted: this.options.encryption,
                isCompressed: this.options.compression
            };

            this.storage.set(key, item);

            // تحليل وتوقع نمط الوصول
            if (this.aiPredictor) {
                this.aiPredictor.learn(key, metadata);
            }

            this.stats.sets++;
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    get(key) {
        try {
            const item = this.storage.get(key);

            if (!item) {
                this.stats.misses++;
                this._predictAndPreload();
                return undefined;
            }

            if (this._isExpired(item.metadata)) {
                this.delete(key);
                this.stats.misses++;
                return undefined;
            }

            let value = item.value;

            // أولاً: فك ضغط البيانات إذا كانت مضغوطة
            if (item.isCompressed) {
                value = compression.decompress(value);
            }

            // ثانياً: فك تشفير البيانات إذا كانت مشفرة
            if (item.isEncrypted) {
                value = encryption.decrypt(value);
            }

            // تحديث نمط الوصول
            item.metadata.accessPattern.push(Date.now());
            if (this.aiPredictor) {
                this.aiPredictor.updateAccessPattern(key, item.metadata.accessPattern);
            }

            this.stats.hits++;
            return value;
        } catch (error) {
            console.error('Cache get error:', error);
            return undefined;
        }
    }

    delete(key) {
        return this.storage.delete(key);
    }

    clear() {
        this.storage.clear();
        this.stats = { hits: 0, misses: 0, sets: 0, aiPredictions: 0, accuracy: 0 };
        if (this.aiPredictor) {
            this.aiPredictor.reset();
        }
    }

    getStats() {
        return {
            ...this.stats,
            size: this.storage.size,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
            aiAccuracy: this.stats.accuracy,
            predictions: this.stats.aiPredictions
        };
    }

    _isExpired(metadata) {
        return metadata.ttl && Date.now() - metadata.createdAt > metadata.ttl * 1000;
    }

    _parseSize(size) {
        if (typeof size === 'number') return size;

        const units = { 'B': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
        const match = String(size).match(/^(\d+)(B|KB|MB|GB)$/);
        if (!match) throw new Error('Invalid size format. Use format: 100MB, 1GB, etc.');
        return parseInt(match[1]) * units[match[2]];
    }

    _getSize(value) {
        return Buffer.from(JSON.stringify(value)).length;
    }

    _predictAndPreload() {
        if (!this.aiPredictor) return;

        const predictions = this.aiPredictor.predict();
        predictions.forEach(key => {
            if (!this.storage.has(key)) {
                this.stats.aiPredictions++;
                // هنا يمكن إضافة منطق التحميل المسبق
            }
        });
    }
}

module.exports = Cache;