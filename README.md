```javascript
npm i ultracachejs
```

## 🎯 الاستخدام السريع

### الإعداد الأساسي
```javascript
const UltraCache = require('ultracachejs');

const cache = new UltraCache({
    maxSize: '1GB',              // الحد الأقصى لحجم الكاش
    compression: true,           // تفعيل الضغط التلقائي
    encryption: true,            // تفعيل التشفير
    ttl: 3600,                  // مدة الصلاحية الافتراضية (بالثواني) | Default validity(with seconds)
    aiEnabled: true,            // تفعيل التنبؤات الذكية | Enable smart predictions
    preloadThreshold: 0.8       // عتبة التحميل المسبق | preload forest
});
```

### عمليات أساسية
```javascript
// تخزين قيمة | store value
cache.set('user:123', { name: 'أحمد', age: 30 }, {
    ttl: 3600,                  // مدة الصلاحية بالثواني | Expiry date in seconds
    priority: 0.8,              // أولوية العنصر (0-1) | Element priority
    compression: true,          // تخطي إعدادات الضغط العامة | Skip general compression settings
    encryption: true            // تخطي إعدادات التشفير العامة | Skip general encryption settings
});

// استرجاع قيمة | Value recovery
const user = cache.get('user:123');

// حذف قيمة | Delete value
cache.delete('user:123');

// مسح الكاش بالكامل | Clear cache completely
cache.clear();
```

### استخدام متقدم
```javascript
// الحصول على إحصائيات الكاش | Get cache statistics
const stats = cache.getStats();
console.log(stats);
/* النتيجة | Result:
{
    hits: 150,                  // عدد الإصابات الناجحة | Number of successful infections
    misses: 30,                 // عدد الفقد | Number of loss
    sets: 200,                  // عدد عمليات التخزين | Number of storage operations
    hitRate: 0.83,              // معدل الإصابة | Incidence rate
    size: 52428800,             // الحجم الحالي بالبايت | Current size in bytes
    aiPredictions: 45,          // عدد التنبؤات الناجحة | Number of successful predictions
    accuracy: 0.85              // دقة التنبؤات | Predictive accuracy
}
*/