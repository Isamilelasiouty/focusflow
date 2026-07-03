# Focusflow — نظام إدارة الإنتاجية الشخصية

نظام شخصي متكامل لإدارة المهام، مشاريع العملاء، Technical SEO، الدراسة، الأهداف، الملاحظات، والوقت — مبني بـ HTML/CSS/JavaScript خالص (بدون Frameworks) ومزامن عبر Firebase.

## ما تم بناؤه في هذه النسخة (MVP فعّال)

هذه نسخة أساسية **تعمل فعليًا وقابلة للنشر مباشرة**، تغطي بعمق الوحدات الأساسية للاستخدام اليومي:

- **Auth كامل:** تسجيل دخول / إنشاء حساب / تسجيل خروج (Firebase Authentication).
- **Dashboard فعّال:** إحصائيات حية، Focus Queue محسوبة تلقائيًا، تقدم عام، مهام متأخرة.
- **Tasks كامل:** إنشاء، تعديل، حذف، تبويبات (اليوم/الأسبوع/متأخر/مكتمل)، فلترة حسب النوع، Checklist داخل كل مهمة.
- **Time Tracker:** بدء/إيقاف تتبع الوقت من تفاصيل المهمة، حفظ تلقائي في `timeEntries`، وربطه بالمهمة.
- **مزامنة Realtime** عبر Firestore (`onSnapshot`) + عمل جزئي دون اتصال (Offline Persistence).
- **Design System** جاهز (Light/Dark tokens) في `css/tokens.css`.
- **بنية Modules قابلة للتوسع** تطابق التخطيط المعماري المتفق عليه.

### الوحدات المتبقية (Scaffolded / قيد التوسع)

الصفحات التالية مسجّلة في الـ Router وتظهر شاشة "قيد التطوير" حاليًا، وبنيتها البرمجية (Firestore rules، الخدمات الأساسية) جاهزة لتُبنى عليها بنفس نمط وحدة Tasks:
**Projects, Clients, SEO Hub, Study, Goals, Notes, References, Reports, Settings.**

> **لماذا بهذا الشكل؟** حجم المشروع الكامل (27 صفحة، عشرات الـ Components) يحتاج بناءً تدريجيًا حقيقيًا كما في أي منتج SaaS. الأساس المعماري (Firebase، Router، Design System، أنماط الـ CRUD) مكتمل وموحّد، بحيث تكرار نفس نمط وحدة `tasks` لأي وحدة أخرى (مثل `goals` أو `notes`) يصبح مباشرًا: خدمة Firestore + قائمة + Modal تفاصيل.

## خطوات التشغيل

### 1. إنشاء مشروع Firebase
1. اذهب إلى [console.firebase.google.com](https://console.firebase.google.com) وأنشئ مشروعًا جديدًا.
2. من **Authentication → Sign-in method**: فعّل "Email/Password".
3. من **Firestore Database**: أنشئ قاعدة بيانات (ابدأ بـ Production mode).
4. من **Project Settings → General → Your apps**: أضف تطبيق ويب (Web App) وانسخ إعدادات `firebaseConfig`.

### 2. ربط المشروع
افتح `js/core/firebase-config.js` واستبدل القيم بإعداداتك الفعلية:
```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### 3. نشر Firestore Rules
انسخ محتوى `firebase/firestore.rules` إلى **Firestore Database → Rules** في الـ Console، ثم انشر.

### 4. التجربة محليًا
لأن الملفات تستخدم ES Modules، يجب تشغيلها عبر سيرفر محلي (وليس فتح `index.html` مباشرة):
```bash
npx serve .
# أو
python3 -m http.server 8080
```

### 5. النشر على GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <رابط-المستودع-الخاص-بك>
git push -u origin main
```
ثم من إعدادات المستودع: **Settings → Pages → Source: main branch / root**.

⚠️ **ملاحظة أمان:** أضف نطاق GitHub Pages الخاص بك (`username.github.io`) إلى **Authentication → Settings → Authorized domains** في Firebase Console حتى يعمل تسجيل الدخول.

## بنية المشروع
```
index.html
css/            tokens, base, layout, components
js/core/        firebase-config, auth, firestore-service, router, event-bus
js/modules/     tasks, dashboard, timetracker (+ وحدات مستقبلية)
js/shared/      components (modal, toast) + utils (date-utils)
firebase/       firestore.rules
```

## الخطوات المقترحة التالية
1. تجربة تسجيل الدخول وإضافة أول مهمة للتأكد من الاتصال بـ Firebase.
2. بناء وحدة **Goals** بنفس نمط `tasks` (الأبسط للبدء بها).
3. بناء **SEO Templates** (Checklists قابلة لإعادة الاستخدام) — القيمة الأعلى لعمل Technical SEO.
4. إضافة Cloud Storage لرفع ملفات المراجع.
5. إضافة صفحة Reports مع Charts (يمكن استخدام Chart.js عبر CDN).
