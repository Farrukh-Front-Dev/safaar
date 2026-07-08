# Backend Dasturchi Uchun Vazifalar (Tasks for Backend)

Ushbu hujjatda `web-admin` va `web-partner` qismlarida qilingan so'nggi yangilanishlar bo'yicha Backend'da qilinishi kerak bo'lgan API va ma'lumotlar bazasi (DB) o'zgarishlari ro'yxati keltirilgan.

## 1. CMS Shablonlar (Email/SMS Templates) API'si
Biz `web-admin` da Email va SMS shablonlarini boshqarish uchun juda qulay sahifa (`/cms/templates`) yaratdik. Ushbu sahifa real ma'lumotlar bilan ishlashi uchun quyidagilar kerak:

### 1.1. Prisma Model
Ma'lumotlar bazasida shablonlarni saqlash uchun yangi jadval (masalan, `NotificationTemplate` yoki `CmsTemplate`) qo'shish kerak. Unda quyidagi maydonlar bo'lishi kerak:
- `id` (UUID)
- `name` (String) - Shablon nomi (Masalan: "SMS OTP Tasdiqlash")
- `code` (String, Unique) - Shablonning unikal kodi (Masalan: `auth_otp_sms`)
- `type` (Enum: `SMS`, `EMAIL`)
- `description` (String) - Qisqacha izoh
- `subject` (String, Optional) - Faqat Email uchun mavzu
- `body` (Text) - Xabar matni. O'zgaruvchilar bilan (Masalan: `Salom {customerName}!`)
- `variables` (String[]) - Shablonda ruxsat etilgan o'zgaruvchilar ro'yxati (Masalan: `["customerName", "otp"]`)
- `isActive` (Boolean) - Faol yoki faol emasligi

### 1.2. API Endpoints
Admin paneldan boshqarish uchun CRUD endpointlar:
- `GET /v1/admin/cms/templates` - Barcha shablonlarni ro'yxatini qaytarish
- `POST /v1/admin/cms/templates` - Yangi shablon yaratish
- `PATCH /v1/admin/cms/templates/:id` - Shablonni tahrirlash (yoki holatini o'zgartirish)
- `DELETE /v1/admin/cms/templates/:id` - Shablonni o'chirish
- `POST /v1/admin/cms/templates/test` - (Ixtiyoriy) Frontend'dan kelgan o'zgaruvchilar asosida SMS yoki Email'ga test xabarini jo'natish xizmati.

### 1.3. @agoda/types
Iltimos, Frontend turlarda ham ushbu `CmsTemplate` (yoki `NotificationTemplate`) interfeysini `packages/types` papkasiga qo'shib qo'ying, biz uni frontenda ishlatamiz.

---

## 2. Hamkorlar Arizasi (Partner Registration Flow)
Hozirda `web-partner` va `web-admin` o'rtasida arizalar almashinuvi to'liq test qilinishi kerak. 

### 2.1. Ariza yuborish va Qabul qilish
- **web-partner:** Hamkor ro'yxatdan o'tayotganda `POST /v1/partners/requests` (yoki mos API) orqali yuborgan arizasi DB'ga to'g'ri saqlanishini tekshirish.
- **web-admin:** Super Admin panelidagi "Hamkorlar -> Arizalar" qismida ushbu yangi arizalar `GET /v1/admin/partners/requests` orqali to'g'ri kelayotganligiga ishonch hosil qilish. Hozir front-end faqat o'zining mock (soxta) bazasidan ishlayapti, chunki backend integratsiyasi to'liq ulanmagan yoki test qilinmagan.

### 2.2. Arizani Tasdiqlash va Xabarnoma (Trigger)
- Admin hamkor arizasini tasdiqlaganda (`PATCH /v1/admin/partners/requests/:id` status = `approved`), avtomatik ravishda Yuqorida yaratilgan (1-bo'lim) CMS shablonlaridan `partner_approved_email` yoki `partner_approved_sms` kodli shablonni chaqirib, hamkorga xush kelibsiz xatini jo'natish logikasini qo'shish kerak.

---

> Iltimos, ushbu o'zgarishlar yakunlangach `develop` branchga push qilib, bizga xabar bering! Biz darhol frontendda haqiqiy API'larni ulaymiz.
