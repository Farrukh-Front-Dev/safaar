# TEXNIK TOPSHIRIQ (TZ)

## SAFAAR.uz — O'zbekiston Milliy Turar Joy va Bron Platformasi

> **Tagline:** "Bron qil, yo'lga chiq!"
> **Domen:** safaar.uz | **Status:** MVP bosqichi (Q4 2026)

---

## Mundarija

1. [Loyiha Haqida Umumiy Ma'lumot](#1-loyiha-haqida-umumiy-malumot)
2. [Tizim Arxitekturasi](#2-tizim-arxitekturasi)
3. [Panel 1: User Web App (Mijozlar Sayti)](#3-panel-1-user-web-app-mijozlar-sayti)
4. [Panel 2: Partner Panel (Hamkorlar Kabineti)](#4-panel-2-partner-panel-hamkorlar-kabineti)
5. [Panel 3: Super Admin Dashboard](#5-panel-3-super-admin-dashboard)
6. [Texnik Stack](#6-texnik-stack)
7. [API Integratsiyalar](#7-api-integratisyalar)
8. [Xavfsizlik Talablari](#8-xavfsizlik-talablari)
9. [Mobillik](#9-mobillik)
10. [Biznes Modeli](#10-biznes-modeli)
11. [Bozor Tahlili va Raqobat Muhiti](#11-bozor-tahlili-va-raqobat-muhiti)
12. [Moliyaviy Prognoz va KPI](#12-moliyaviy-prognoz-va-kpi)
13. [Yo'l Xaritasi (Roadmap)](#13-yol-xaritasi-roadmap)
14. [Dizayn Talablari](#14-dizayn-talablari)

---

## 1. Loyiha Haqida Umumiy Ma'lumot

### 1.1 Platforma tasnifi

**SAFAAR.uz** — O'zbekistonning shahar mehmonxonalaridan tortib tog' bag'ridagi eng chekka oromgohlargacha bo'lgan barcha dam olish joylarini birinchi marta bitta raqamli platformada, mahalliy to'lov va SMS-xabarnoma tizimi bilan birlashtiruvchi milliy onlayn bron ekotizimi.

| Atribut | Qiymat |
|---|---|
| Loyiha nomi | SAFAAR.uz |
| Huquqiy nom | OOO "SAFAAR" |
| Til | O'zbek (lotin + kirill), Rus, Ingliz |
| Valyuta | UZS (so'm) |
| To'lov tizimlari | Click, Payme, Uzcard, Humo, naqd |
| Boshlanish yili | 2025 |
| MVP bosqichi | Q4 2026 |

### 1.2 Muammo

O'zbekistonda turizm bozori jadal o'sayotgan bo'lsa-da, raqamli infratuzilma ortda qolmoqda:

| Muammo | Ta'sir |
|---|---|
| 80% mehmonxonalar broni telefon yoki shaxsan qabul qilinadi | Mijozlar uchun noqulaylik, vaqt yo'qotish |
| Narx va mavjudlikni solishtirish uchun 5-10 saytga kirish kerak | Ma'lumot tarqoq, ishonchlilik past |
| 0% onlayn avtobus bron imkoniyati — faqat kassada | Oldindan rejalashtirish imkonsiz |
| Chekka hududlar (tog', suv ombori, milliy bog'lar) raqamli xaritada ko'rinmaydi | Katta segment e'tibordan chetda |
| Xalqaro platformalar mahalliy to'lov tizimlari bilan integratsiyalashmagan | Mahalliy foydalanuvchilar uchun mos emas |
| 85% bronlar an'anaviy usulda | Raqamlashtirish ulushi juda past |

### 1.3 Yechim

SAFAAR — barcha turdagi turar joy va transport xizmatlarini bitta platformada birlashtirgan, O'zbekistonga 100% moslashgan yagona milliy ekotizim:

| Yo'nalish | Tavsif |
|---|---|
| **Turar joy** | Shahar mehmonxonalari, dacha, gostinka (guesthouse), sanatoriy, tog' oromgohlari, suv bo'yi maskanlari |
| **Transport** | Shaharlararo avtobus chiptalari (qo'shimcha yo'nalish) |
| **Tajribalar** | Turistik ekskursiyalar, mahalliy gidlar, sayohat paketlari |

### 1.4 Raqobatdosh afzalliklar

1. **To'liq mahalliylashtirish** — O'zbek, Rus va Ingliz tillarida to'liq interfeys
2. **Mahalliy to'lov integratsiyasi** — Click, Payme, Uzcard, Humo bilan to'g'ridan-to'g'ri bog'lanish
3. **Keng qamrov** — Yirik mehmonxonadan tortib bitta xonali gostinka uygacha, shahardan tog' bag'rigacha
4. **Mahalliy PMS integratsiyasi** — SIVA Hotel va boshqa tizimlar bilan avtomatik kanal-menejer ulanishi
5. **SMS-chegirma tizimi** — Foydalanuvchilarga joriy chegirmalar haqida avtomatik SMS-xabarnoma
6. **24/7 Mahalliy qo'llab-quvvatlash** — O'zbek tilida mijozlarga xizmat ko'rsatish

---

## 2. Tizim Arxitekturasi

Platforma 3 ta mustaqil frontend + 1 ta backend + 1 ta umumiy turlar paketidan iborat monorepo:

```
┌─────────────────────────────────────────────────────────────┐
│                    SAFAAR Ekotizimi                          │
│                                                              │
│   safaar.uz          — Mijozlar sayti (User Web App)         │
│   partner.safaar.uz — Hamkorlar kabineti                    │
│   admin.safaar.uz   — Super Admin Dashboard                  │
│                                                              │
│   Barcha uchun yagona backend API (NestJS)                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Monorepo tuzilmasi

```
/
├── apps/
│   ├── backend/       NestJS API (port 4000)
│   ├── web-user/      Next.js — safaar.uz (port 3000)
│   ├── web-partner/   Next.js — partner.safaar.uz (port 3001)
│   └── web-admin/     Next.js — admin.safaar.uz (port 3002)
├── packages/
│   └── types/         Umumiy TypeScript turlari (API shartnomasi)
├── TZ_Safaar_Platform.md  Ushbu hujjat
└── aim/               Investor materiallari (pitch deck, PDF)
```

### 2.2 Arxitektura prinsiplari

- **Monorepo** — npm workspace asosida, barcha applar bir repoda
- **Yagona API** — barcha frontendlar bitta backend ga murojaat qiladi
- **RBAC** — Role-Based Access Control: USER, PARTNER, ADMIN, SUPER_ADMIN
- **Server-Side Rendering** — Next.js App Router (React Server Components)
- **Mobile-first** — Barcha frontendlar mobil qurilmalarga moslashtirilgan

---

## 3. Panel 1: User Web App (Mijozlar Sayti)

**Domen:** `safaar.uz`

### 3.1 Bosh sahifa

- Hero banner + qidiruv bloki (turar joy asosiy, avtobus qo'shimcha tab)
- Chegirmadagi takliflar (deals karuseli)
- Tanlangan mehmonxona va dam olish maskanlari (featured)
- Mashhur yo'nalishlar (Toshkent, Samarqand, Buxoro, Xiva, Chorvoq, Chimgan)
- Hamkorlar logotiplari
- Ishonch qatori (statistika: ob'ektlar, shaharlar, reyting)
- Foydalanuvchi sharhlari va baholashlari

### 3.2 Qidiruv va filtrlash

**Turar joy (asosiy):**
- Shahar/hudud tanlash (avtocomplete + xarita)
- Kirish va chiqish sanasi
- Mehmonlar soni
- Filter: narx oralig'i, yulduzlar, turar joy turi, qulayliklar, reyting
- Saralash: narx (o'sish/kamayish), reyting, masofa
- Xarita ko'rinishi (Google Maps / Yandex Maps)

**Avtobus (qo'shimcha):**
- Ketish shahri → Borish shahri
- Sana
- Yo'lovchilar soni

### 3.3 Xizmat tafsilotlari

**Turar joy:**
- Foto galereya (slider, lightbox)
- Xona turlari va real-time narxlar
- Qulayliklar ro'yxati (Wi-Fi, hovuz, parking, nonushta, konditsioner...)
- Xarita (joylashuv)
- Mehmon sharhlari va reyting
- "Bron qilish" tugmasi

**Avtobus:**
- Marshrut va to'xtash joylari
- Jo'nash/kelish vaqti
- O'rindiq sxemasi (interaktiv tanlov)

### 3.4 Bron qilish jarayoni (Checkout)

1. Ma'lumotlarni kiritish (ism, telefon, email)
2. Xona/o'rindiq tanlash
3. To'lov usulini tanlash (Click / Payme / Uzcard / Humo / Naqd)
4. SMS OTP orqali tasdiqlash
5. Bron tasdiqlanishi (email + SMS bildirishnoma)

### 3.5 Shaxsiy kabinet

- Profil tahrirlash
- Joriy bronlar holati
- Bronlar tarixi
- Sevimlilar ro'yxati
- Bonus va chegirmalar
- Shikoyat va murojaatlar

### 3.6 Qo'shimcha sahifalar

- Haqimizda
- Aloqa
- FAQ
- Shartlar va qoidalar
- Maxfiylik siyosati

### 3.7 Funksional talablar

| Funksiya | Tavsif |
|---|---|
| Ro'yxatdan o'tish | Telefon raqam + SMS OTP |
| Ijtimoiy kirish | Google, Facebook OAuth |
| Xarita integratsiyasi | Google Maps / Yandex Maps |
| Push bildirishnomalar | Bron holati yangilanishi (Firebase) |
| Multi-til | O'zbek / Rus / Ingliz |
| Responsiv dizayn | Mobile-first |
| PWA | Telefonga o'rnatish mumkin |

---

## 4. Panel 2: Partner Panel (Hamkorlar Kabineti)

**Domen:** `partner.safaar.uz`

Ushbu panel mehmonxona egalari, dacha va gostinka uy egalari, sanatoriyalar, tog' oromgohlari va avtobus kompaniyalari uchun mo'ljallangan.

### 4.1 Ro'yxatdan o'tish va tasdiqlash

- Kompaniya ma'lumotlarini kiritish (nom, manzil, STIR, telefon)
- Ob'ekt turini tanlash
- Hujjat yuklash (litsenziya, soliq guvohnomasi)
- Admin tomonidan moderatsiya (1-3 ish kuni)
- Kirish ma'lumotlari email/SMS orqali yuboriladi

### 4.2 Dashboard

| Ko'rsatkich | Tavsif |
|---|---|
| Bugungi bronlar | Real-time yangilanadi |
| Oylik daromad | UZS da hisoblanadi |
| Umumiy mijozlar | Platformadagi faollik |
| Reyting | O'rtacha mijoz bahosi |

- Bronlar grafigi (kunlik/haftalik/oylik)
- Oxirgi bronlar ro'yxati
- Tezkor harakatlar paneli

### 4.3 Xizmatlarni boshqarish

**Turar joy hamkori:**
- Xona/uy qo'shish, tahrirlash, o'chirish
- Ob'ekt turlari (standart, lyuks, suite, butun uy)
- Narxlar kalendari (dinamik narxlash)
- Mavjudlik boshqaruvi (real-time)
- Rasm va media yuklash
- Qulayliklar belgilash

**Avtobus kompaniyasi:**
- Marshrut qo'shish va tahrirlash
- Avtobus parki boshqaruvi
- Reys jadvalini kiritish
- O'rindiq sxemasini sozlash
- Narx belgilash

### 4.4 Bronlar boshqaruvi

- Barcha bronlar (kutilmoqda / tasdiqlangan / bekor qilingan)
- Bronni tasdiqlash yoki rad etish
- Mijoz bilan bog'lanish (chat / qo'ng'iroq)
- Bron tarixini eksport qilish (Excel / PDF)

### 4.5 Moliya

- Daromad hisoboti (kunlik / oylik / yillik)
- To'lovlar holati
- Komissiya hisobi (SAFAAR foizi)
- To'lov so'rash (pul yechib olish)
- Cheklar va hujjatlar arxivi

### 4.6 Sharhlar va reyting

- Mijozlar sharhlarini ko'rish
- Reytingga javob berish
- Reyting statistikasi va trendlar

### 4.7 Sozlamalar

- Profil ma'lumotlari
- Bank rekvizitlari
- Bildirishnoma sozlamalari
- Parol o'zgartirish
- Xodimlarni boshqarish (multi-user)

---

## 5. Panel 3: Super Admin Dashboard

**Domen:** `admin.safaar.uz`

### 5.1 Dashboard

| KPI | Tavsif |
|---|---|
| Jami foydalanuvchilar | Platformadagi barcha mijozlar |
| Faol hamkorlar | Tasdiqlangan ob'ekt egalari |
| Bugungi bronlar | Real-time ko'rsatkich |
| Oylik daromad | Jami platforma daromadi |

- Real-time statistika grafiklari
- Xaritada viloyatlar bo'yicha faollik
- So'nggi harakatlar lenti

### 5.2 Foydalanuvchilar boshqaruvi

- Barcha ro'yxatdan o'tgan foydalanuvchilar
- Qidirish va filtrlash (telefon, ism, sana)
- Foydalanuvchi tafsilotlarini ko'rish
- Bloklash / blokdan chiqarish
- Bonus va chegirma berish
- Murojaatlarni ko'rish

### 5.3 Hamkorlar boshqaruvi

- Yangi arizalar (tasdiqlash / rad etish)
- Barcha hamkorlar ro'yxati
- Hamkor profilini ko'rish va tahrirlash
- Hamkorni to'xtatib qo'yish / o'chirish
- Komissiya foizini belgilash
- Hujjatlarni tekshirish

### 5.4 Bronlar boshqaruvi

- Barcha bronlar (hamma hamkorlar bo'yicha)
- Qidirish (ID, ism, telefon, sana)
- Bron tafsilotlari
- Bronni bekor qilish (admin huquqi)
- Qaytarish (refund) tasdiqlash
- Eksport (Excel, CSV)

### 5.5 Moliya va hisobotlar

- Umumiy daromad hisoboti
- Hamkorlar bo'yicha daromad tahlili
- Komissiya hisobi
- To'lov so'rovlari (hamkorlar)
- To'lovni tasdiqlash / rad etish
- Soliq hisobotlari
- Vizual grafik va diagrammalar

### 5.6 Kontent boshqaruvi (CMS)

- Bosh sahifa bannerlari
- Maxsus taklif va aksiyalar
- Yangiliklar va e'lonlar
- FAQ tahrirlash
- Statik sahifalar (Haqimizda, Shartlar)
- Email va SMS shablonlari

### 5.7 Kategoriyalar va manzillar

- Shaharlar va viloyatlar boshqaruvi
- Turar joy kategoriyalari
- Xona turlari
- Qulayliklar katalogi

### 5.8 Chegirma va promo-kodlar

- Promo-kod yaratish
- Chegirma shartlari (foiz / summa)
- Amal qilish muddati
- Foydalanish statistikasi

### 5.9 Shikoyatlar va yordam

- Barcha murojaat va shikoyatlar
- Holat: yangi / jarayonda / yopilgan
- Javob yozish
- Hamkorga yo'naltirish
- Statistika va hisobot

### 5.10 Tizim sozlamalari

- Sayt sozlamalari (nomi, logotipi, aloqa ma'lumotlari)
- To'lov tizimlari sozlamalari (Click, Payme)
- SMS provider sozlamalari (Eskiz.uz / PlayMobile)
- Email sozlamalari (SMTP)
- Adminlar boshqaruvi (rol va huquqlar)
- Audit log (kim nima qildi)
- Backup va xavfsizlik

---

## 6. Texnik Stack

### Frontend

| Qism | Texnologiya |
|---|---|
| Framework | Next.js 16 (React 19) |
| UI Library | Tailwind CSS v4 |
| Til | TypeScript (strict) |
| Xarita | Google Maps API / Yandex Maps |
| Grafiklar | Recharts / Chart.js |
| Ikonkalar | Lucide |

### Backend

| Qism | Texnologiya |
|---|---|
| Framework | NestJS |
| Ma'lumotlar bazasi | PostgreSQL (Neon) |
| Cache | Redis |
| File storage | AWS S3 / Yandex Object Storage |
| Auth | JWT + Refresh Token |
| SMS | Eskiz.uz / PlayMobile |
| Queue | BullMQ (Redis) |

### DevOps

| Qism | Texnologiya |
|---|---|
| Server | VPS / Railway |
| CDN | Cloudflare |
| CI/CD | GitHub Actions |
| Monitoring | Grafana + Prometheus |
| Container | Docker |

---

## 7. API Integratsiyalar

| Xizmat | Maqsad |
|---|---|
| Click API | To'lov qabul qilish (push-to'lov) |
| Payme API | To'lov qabul qilish (subscribe) |
| Uzcard / Humo | Karta to'lovlari |
| Eskiz.uz / PlayMobile | SMS OTP yuborish |
| Google Maps API | Xarita va navigatsiya |
| Yandex Maps | Alternativ xarita |
| Google / Facebook OAuth | Ijtimoiy tarmoq orqali kirish |
| Firebase Cloud Messaging | Push bildirishnomalar |

---

## 8. Xavfsizlik Talablari

- HTTPS (SSL/TLS) — barcha saytlarda majburiy
- SMS OTP — telefon raqamni tasdiqlash
- JWT + Refresh Token — autentifikatsiya (access: 15 min, refresh: 7 kun)
- Rate limiting — brute-force hujumlaridan himoya
- SQL injection himoya (Prisma ORM orqali)
- XSS himoya (Next.js built-in)
- CORS sozlamalari (faqat ruxsat etilgan domenlar)
- Admin panelda IP restriction (ixtiyoriy)
- Audit log — barcha muhim harakatlar yozib boriladi
- RBAC — rol asosida huquqlarni chegaralash

---

## 9. Mobillik

| Platforma | Hozirgi | Kelajak |
|---|---|---|
| Web (PWA) | ✅ Telefonga o'rnatish mumkin | — |
| iOS (Native) | ❌ | React Native |
| Android (Native) | ❌ | React Native |
| Partner panel | 📱 Responsive (tablet) | — |
| Admin panel | 📱 Responsive (tablet) | — |

---

## 10. Biznes Modeli

| Manba | Tavsif | Ulush |
|---|---|---|
| Bron komissiyasi | Har bir muvaffaqiyatli brondan | 8–12% |
| Premium obuna | Hamkorlar uchun kengaytirilgan statistika va ustuvor ko'rinish | Oyiga $XX |
| SMS-chegirma obuna | Foydalanuvchilar joriy chegirmalar haqida SMS oladi (oyiga 9,990 – 69,990 so'm) | Oylik to'lov |
| Reklama (CPC/Banner) | Mahalliy bizneslar va brendlar uchun targetli reklama | Kampaniya asosida |
| Korporativ paket (B2B) | Kompaniyalar uchun xodimlar safarini boshqarish va hisobotlash | Oylik + komissiya |

**SMS-chegirma obuna modeli** — O'zbekistonda Click va Payme'ning pullik obuna tariflari (oyiga 9,990 – 69,990 so'm) allaqachon keng qo'llaniladi. SAFAAR ham shu modelni joriy etadi: foydalanuvchi oylik obuna to'lovi evaziga mehmonxona, dacha, gostinka va boshqa dam olish joylaridagi joriy chegirmalar haqida avtomatik SMS-bildirishnoma oladi.

---

## 11. Bozor Tahlili va Raqobat Muhiti

### 11.1 Bozor ko'rsatkichlari

| Ko'rsatkich | Qiymat |
|---|---|
| Aholi | 36M+ |
| Turizm bozori (TAM) | $3.2B |
| Onlayn bron segmenti (SAM) | $480M |
| SAFAAR boshlang'ich maqsadi (SOM) | $48M |
| 2023 yilgi turistlar | 6.7M+ (tarixiy rekord) |
| Ichki turizm o'sishi | 20%+ yillik |
| Hukumat qo'llab-quvvatlashi | #1 ustuvor yo'nalish |

### 11.2 Raqobat tahlili

| Xususiyat | SAFAAR.uz | Bronla.uz | Xalqaro platformalar |
|---|---|---|---|
| Mahalliylashtirish | ✅ To'liq | ✅ Qisman | ❌ |
| Mahalliy to'lov | ✅ Click, Payme, Uzcard, Humo | ❌ | ❌ |
| Chegirma-SMS tizimi | ✅ | ❌ | ❌ |
| Chekka hudud qamrovi | ✅ To'liq | ❌ | ❌ |
| Dacha, gostinka, sanatoriy | ✅ | ❌ | ❌ |
| Avtobus chiptalari | ✅ | ❌ | ❌ |
| Mahalliy qo'llab-quvvatlash | ✅ 24/7 | ❌ | ❌ |

**Xulosa:** Bozorda mahalliy to'lov tizimi + SMS-chegirma xabarnomasi + chekka hududlarni to'liq qamrab oluvchi platforma hali mavjud emas. SAFAAR bu bo'shliqni birinchi bo'lib egallaydi.

---

## 12. Moliyaviy Prognoz va KPI

### 12.1 Asosiy KPI (1-yil)

| Ko'rsatkich | Maqsad |
|---|---|
| Hamkorlar soni | 1,200 |
| Bronlar soni (yillik) | 18,000 |
| Yillik daromad | $180K |
| Break-even | 18 oy |

### 12.2 Investitsiya taklifi

| Parametr | Qiymat |
|---|---|
| So'rov | $500K |
| Ulush | 15–20% |
| Pre-money baholash | $2.5M – $3.5M |

**Mablag' taqsimoti:**

| Yo'nalish | Ulush |
|---|---|
| Texnologiya va platforma rivojlantirish | 35% |
| Marketing va foydalanuvchi jalb qilish | 25% |
| Jamoa | 25% |
| Operatsion xarajatlar | 15% |

---

## 13. Yo'l Xaritasi (Roadmap)

| Bosqich | Muddat | Tarkib |
|---|---|---|
| **MVP** | Q4 2026 | Samarqand pilot (200+ ob'ekt). Mehmonxona bron. Hamkor panel. Admin dashboard. Click & Payme integratsiyasi. SMS OTP tasdiqlash. |
| **Beta** | Q1 2027 | Toshkent, Buxoro, Chorvoq. Avtobus bron (o'rindiq sxemasi). Multi-til (O'zbek/Rus/Ingliz). Google Maps integratsiyasi. PWA. Google & Facebook OAuth. |
| **Kengayish** | Q2 2027 | Xiva, Zomin, Amirsoy, Farg'ona vodiysi. Promo-kodlar va bonus tizimi. Kengaytirilgan hisobotlar. B2B korporativ paket. Push bildirishnomalar. |
| **Milliy qamrov** | Q3–Q4 2027 | 14 viloyat to'liq qamrov. iOS va Android ilovalar (React Native). SMS-chegirma obuna to'liq ishga tushadi. AI tavsiyalar tizimi. Marketing kampaniyalar. Qo'shni davlatlarga ekspansiya. |

---

## 14. Dizayn Talablari

- **Stil:** Zamonaviy, professional, O'zbekistonga xos ranglar (ko'k, yashil)
- **Brend:** SAFAAR.uz — "Bron qil, yo'lga chiq!"
- **Shriftlar:** O'zbek kirill va lotin alifbosini qo'llab-quvvatlash
- **Ikonkalar:** Lucide
- **Dark mode:** Ixtiyoriy (v2.0)
- **Yuklanish tezligi:** Core Web Vitals — yaxshi ko'rsatkichlar
- **Mobile-first:** Barcha sahifalar mobil qurilmalarga mos

---

*Hujjat versiyasi: 3.0 | Sana: 2026-yil iyul*
*Tayyorladi: SAFAAR Development Team*
*Asos: Investor Pitch Deck v1.0, SAFAAR Platform Spec, Bozor tahlili*
