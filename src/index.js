const Cache = require('./core/Cache');

module.exports = class UltraCache {
    constructor(options = {}) {
        const defaultOptions = {
            strategy: 'smart',
            maxSize: '1GB',
            compression: true,
            encryption: false,
            ttl: 3600, // 1 hour default
            aiEnabled: true,
            preloadThreshold: 0.8, // التحميل المسبق عندما تكون دقة التنبؤ أعلى من 80%
            adaptiveCompression: true // ضغط ديناميكي بناءً على نمط الاستخدام
        };

        this.options = { ...defaultOptions, ...options };
        this.cache = new Cache(this.options);
    }

    /**
     * تخزين قيمة في الكاش
     * @param {string} key - المفتاح
     * @param {*} value - القيمة
     * @param {Object} options - خيارات إضافية (ttl, compression, encryption, priority)
     * @returns {boolean} - حالة النجاح
     */
    set(key, value, options = {}) {
        return this.cache.set(key, value, {
            ...options,
            priority: this._calculatePriority(key, value)
        });
    }

    /**
     * استرجاع قيمة من الكاش
     * @param {string} key - المفتاح
     * @returns {*} القيمة المخزنة أو undefined
     */
    get(key) {
        return this.cache.get(key);
    }

    /**
     * حذف قيمة من الكاش
     * @param {string} key - المفتاح
     * @returns {boolean} - حالة النجاح
     */
    delete(key) {
        return this.cache.delete(key);
    }

    /**
     * مسح الكاش بالكامل
     */
    clear() {
        this.cache.clear();
    }

    /**
     * الحصول على إحصائيات الكاش
     * @returns {Object} إحصائيات الكاش
     */
    getStats() {
        return this.cache.getStats();
    }

    /**
     * حساب أولوية العنصر بناءً على حجمه وأهميته
     * @private
     */
    _calculatePriority(key, value) {
        const size = Buffer.from(JSON.stringify(value)).length;
        const stats = this.getStats();
        const frequency = stats.hits / (stats.hits + stats.misses) || 0;

        // حساب الأولوية بناءً على:
        // 1. حجم البيانات (البيانات الأصغر = أولوية أعلى)
        // 2. معدل الاستخدام
        // 3. توقعات الذكاء الاصطناعي

        const sizeFactor = Math.max(0.1, 1 - (size / (1024 * 1024))); // تفضيل العناصر الأصغر
        const usageFactor = Math.max(0.1, frequency);

        return (sizeFactor * 0.4 + usageFactor * 0.6).toFixed(2);
    }
};