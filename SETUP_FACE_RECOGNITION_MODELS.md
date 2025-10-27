# إعداد نماذج التعرف على الوجوه (Face-API.js Models)

## المطلوب

لتشغيل نظام التعرف على الوجوه، يجب تحميل نماذج face-api.js ووضعها في مجلد `public/models/`.

---

## الطريقة 1: التحميل من GitHub (موصى بها)

### الخطوة 1: افتح الرابط التالي
```
https://github.com/justadudewhohacks/face-api.js-models/tree/master/models
```

### الخطوة 2: حمل الملفات التالية

#### 📦 SSD MobileNet V1 (Face Detection)
- `ssd_mobilenetv1_model-weights_manifest.json`
- `ssd_mobilenetv1_model-shard1`

#### 📦 Face Landmark 68 (Face Landmarks)
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`

#### 📦 Face Recognition Model (Face Embeddings)
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`

### الخطوة 3: ضع جميع الملفات في المجلد
```
public/models/
```

### هيكل المجلد النهائي:
```
public/
└── models/
    ├── ssd_mobilenetv1_model-weights_manifest.json
    ├── ssd_mobilenetv1_model-shard1
    ├── face_landmark_68_model-weights_manifest.json
    ├── face_landmark_68_model-shard1
    ├── face_recognition_model-weights_manifest.json
    ├── face_recognition_model-shard1
    └── face_recognition_model-shard2
```

---

## الطريقة 2: استخدام CDN (بديل)

إذا كنت تريد استخدام CDN بدلاً من تحميل الملفات:

### تعديل `src/utils/faceApiLoader.ts`:
```typescript
const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js-models@master/models';
```

### ملاحظة مهمة:
- استخدام CDN يتطلب اتصال إنترنت دائماً
- الطريقة الأولى (التحميل المحلي) أفضل للأداء والعمل Offline

---

## الطريقة 3: استخدام NPM Package (سريع)

```bash
# تثبيت الحزمة
npm install @vladmandic/face-api

# ثم انسخ الملفات من:
node_modules/@vladmandic/face-api/model/
# إلى:
public/models/
```

---

## التحقق من التثبيت

بعد وضع الملفات، افتح المتصفح Console وتأكد من:

```javascript
// لا يجب أن ترى أخطاء 404 عند تحميل الصفحة
// Console log:
✅ بدء تحميل نماذج face-api.js...
✅ تم تحميل جميع النماذج بنجاح
```

---

## معلومات إضافية

### حجم الملفات
- المجموع الكلي: ~6 MB
- يتم تحميلها مرة واحدة فقط عند فتح الصفحة

### الاستخدام
بعد التثبيت الصحيح:
1. افتح `/real-time-face-recognition`
2. يجب أن ترى رسالة "تم تحميل جميع النماذج بنجاح"
3. يمكنك الآن استخدام الكاميرا أو رفع صور

---

## استكشاف الأخطاء

### ❌ خطأ: "Failed to load models"
**الحل:** تأكد من أن جميع الملفات موجودة في `public/models/`

### ❌ خطأ: "404 Not Found"
**الحل:** تأكد من أسماء الملفات صحيحة تماماً (حساسة لحالة الأحرف)

### ❌ خطأ: "لم يتم اكتشاف وجه"
**الحل:** 
- تأكد من الإضاءة الجيدة
- اجعل الوجه أمام الكاميرا مباشرة
- جرب صور أوضح

---

## روابط مفيدة

- [face-api.js GitHub](https://github.com/justadudewhohacks/face-api.js)
- [face-api.js Models](https://github.com/justadudewhohacks/face-api.js-models)
- [face-api.js Documentation](https://justadudewhohacks.github.io/face-api.js/docs/)

---

## الدعم

إذا واجهت أي مشكلة، تحقق من:
1. Console في المتصفح للأخطاء
2. Network tab للتأكد من تحميل الملفات
3. أن الملفات في المجلد الصحيح `public/models/`