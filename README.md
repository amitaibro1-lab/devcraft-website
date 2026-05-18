# DevCraft — פתרונות דיגיטל מתקדמים

אתר עסקי מלא עם מערכת תשלומים ודשבורד ניהול.

## מחסנית טכנולוגית

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** לעיצוב
- **Framer Motion** לאנימציות
- **Nodemailer** לשליחת מיילים
- **PayPlus** שער תשלומים ישראלי
- **JSON files** כמסד נתונים פשוט

---

## התחלה מהירה

### 1. התקנת תלויות

```bash
npm install
```

### 2. הגדרת משתני סביבה

קובץ `.env.local` נמצא בשורש הפרויקט. מלא את הערכים:

```env
DASHBOARD_PASSWORD=admin123
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
PAYPLUS_API_KEY=your_api_key
PAYPLUS_SECRET_KEY=your_secret_key
PAYPLUS_PAGE_UID=your_payment_page_uid
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. איך לקבל מפתחות PayPlus

1. כנס ל-[payplus.co.il](https://payplus.co.il) ופתח חשבון
2. עבור ל-API Management → הפק API Key ו-Secret Key
3. צור Payment Page → קבל Page UID
4. לאחר פריסה, הגדר Webhook URL: `https://yoursite.com/api/payment/webhook`

### 4. איך להגדיר Gmail App Password

1. כנס לחשבון Google שלך → Security
2. הפעל 2-Step Verification אם לא פעיל
3. חפש "App Passwords" ← צור אחת עבור "Mail"
4. הכנס את הסיסמה ב-`EMAIL_PASS`

### 5. הפעלה מקומית

```bash
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000)

### 6. דשבורד ניהול

עבור ל-[http://localhost:3000/dashboard](http://localhost:3000/dashboard)

סיסמה ברירת מחדל: `admin123` — שנה ב-`DASHBOARD_PASSWORD`

---

## פריסה ב-Vercel

1. דחוף את הקוד ל-GitHub
2. חבר ב-[vercel.com](https://vercel.com) → Import Project
3. הוסף **כל** משתני הסביבה ב-Settings → Environment Variables
4. פרוס!
5. עדכן `NEXT_PUBLIC_BASE_URL` לכתובת ה-Vercel שלך
6. הגדר Webhook URL ב-PayPlus: `https://yoursite.com/api/payment/webhook`

> **שים לב**: ב-Vercel קבצי JSON אינם persistent בין deployments. לפרודקשן רציני, שקול מעבר ל-Vercel Postgres, MongoDB Atlas, או PlanetScale.

---

## מבנה הפרויקט

```
src/
  app/
    page.tsx                    ← דף הבית
    services/page.tsx           ← שירותים
    pricing/page.tsx            ← מחירים
    about/page.tsx              ← אודות
    contact/page.tsx            ← יצירת קשר
    payment/success/page.tsx    ← תשלום הצליח
    payment/cancel/page.tsx     ← תשלום בוטל
    dashboard/page.tsx          ← דשבורד ניהול
    api/
      contact/route.ts
      services/route.ts
      payments/route.ts
      payments/export/route.ts
      payment/create-session/route.ts
      payment/webhook/route.ts
      config/route.ts
      inquiries/route.ts
      dashboard/auth/route.ts
  components/
    Navbar.tsx
    ServiceCard.tsx
    PricingCard.tsx
    CustomQuoteForm.tsx
    PaymentButton.tsx
    dashboard/
      KPICard.tsx
      InquiryRow.tsx
      BarChart.tsx
      PaymentsTable.tsx
      ServiceEditor.tsx
      PackageEditor.tsx
  lib/
    payplus.ts          ← PayPlus integration
    mailer.ts           ← Nodemailer
    db.ts               ← JSON file helpers
  data/
    services.json       ← שירותים ומחירים (עריכה דרך דשבורד)
    inquiries.json      ← פניות
    payments.json       ← תשלומים
    config.json         ← הגדרות כלליות
```
