# Safaar Web-User — Qilinishi Kerak Bo'lgan Ishlar Ro'yxati (TODO Roadmap)

> **Loyiha:** `apps/web-user` (safaar.uz mijozlar platformasi)  
> **Status:** MVP Ishlab Chiqish Bosqichi  
> **Oxirgi yangilanish:** 2026-07-20

---

## 📌 Belbilar va Status
- ✅ **Bajarildi** (Completed & Tested)
- ⏳ **Jarayonda** (In Progress)
- 📋 **Rejalashtirilgan** (Planned / Pending)

---

## 1. 🏠 Bosh Sahifa (Home Page — `/[lang]`)

- [x] **Hero & SearchBar**: Sarlavha, visual glow backdrop, tezkor shahar chipslari va qidiruv paneli.
- [x] **Featured Hotels**: Mashhur mehmonxonalar karuseli (auto-scroll va narxlar).
- [x] **Deals Section**: Chegirmadagi maxsus takliflar va vaqt taymeri.
- [x] **Popular Cities**: Mashhur yo'nalishlar (Toshkent, Samarqand, Buxoro, Xiva va h.k.).
- [x] **Ishonchli Hamkorlar**: `GET /catalog/partners-showcase` API integratsiyasi va brendlar karuseli.
- [x] **TrustBar**: Real-time platforma statistikasi (`GET /stats/public`) hamda to'lov logolari.
- [ ] **Mijozlar Fikrlari**: Mijozlar sharhlari karuseli/slideri (`locales/home.json` reviews integratsiyasi).

---

## 2. 🔍 Qidiruv va Filtrlash (Hotels & Search — `/[lang]/hotels`)

- [x] **Asosiy qidiruv sahifasi**: Shahar bo'yicha mehmonxonalar ro'yxati.
- [ ] **Narx oralig'i filtri**: Min/Max narx slayderi (Range Slider).
- [ ] **Qulayliklar va Yulduzlar filtri**: Wi-Fi, hovuz, nonushta, yulduzlar soni bo'yicha filter checkboxlari.
- [ ] **Saralash (Sorting)**: Narx (o'sish/kamayish), reyting va ommaboplik bo'yicha saralash drop-down.
- [ ] **Interaktiv Xarita Ko'rinishi**: Xaritada mehmonxonalarni pin ko'rinishida ko'rsatish toggle'i.
- [ ] **Pagination / Infinite Scroll**: Natijalarni sahifalash.

---

## 3. 🏨 Mehmonxona Tafsilotlari (`/[lang]/hotels/[slug]`)

- [ ] **Foto Galereya**: Slider va lightbox ko'rinishidagi yuqori sifatli rasmlar.
- [ ] **Xonalar Ro'yxati**: Xona turlari, sig'imi va real-time narxlarni tanlash paneli.
- [ ] **Qulayliklar Nishonlari**: Wi-Fi, parking, konditsioner belgilari va to'liq ro'yxat.
- [ ] **Joylashuv Xaritasi**: Mehmonxona manzili va atrofdagi diqqatga sazovor joylar.
- [ ] **Mijozlar Sharhlari**: Reytinglar va matnli sharhlar ro'yxati.
- [ ] **Sticky Bron Qilish CTA**: Mobil va desktopda pastda qotib turuvchi tezkor bron qilish tugmasi.

---

## 4. 💳 Bron Qilish va Checkout (`/[lang]/booking/[id]`)

- [ ] **Mehmon Ma'lumotlari Formasi**: Ism-sharif, telefon raqam va maxsus istaklar.
- [ ] **To'lov Tizimini Tanlash**: Click, Payme, Uzcard, Humo va naqd to'lov variantlari.
- [ ] **SMS OTP Tasdiqlash**: Telefon raqamga SMS kod yuborish va tasdiqlash simulyatsiyasi.
- [ ] **Voucher & Tasdiqlash**: Bron muvaffaqiyatli yakunlangach voucher yuklab olish / chop etish.

---

## 5. 🚌 Avtobus va Chipta Bron Qilish (`/[lang]/buses`)

- [x] **Yo'nalish Qidiruvi**: Jo'nash va yetib borish shahri tanlovi.
- [ ] **Interaktiv Joy Tanlash (SeatPicker)**: Avtobus sxemasida bo'sh va band joylarni tanlash interfeysi.
- [ ] **Yo'lovchi Ma'lumotlari**: Pasport/ID va telefon kiritish formasi.

---

## 6. 👤 Shaxsiy Kabinet (User Account — `/[lang]/account`)

- [x] **Profil Formasi**: Shaxsiy ma'lumotlarni ko'rish va tahrirlash.
- [ ] **Mening Bronlarim**: Faol, yakunlangan va bekor qilingan bronlar tablari.
- [ ] **Sevimlilar**: Saqlangan mehmonxonalar ro'yxati (Favorites).
- [ ] **Bonus Tizimi**: Keshbek va toplangan bonus ballar balansini ko'rsatish.

---

## 7. 🚀 Optimizatsiya, SEO va PWA

- [x] **Multi-til (i18n)**: O'zbek, Rus va Ingliz tillari lug'atlari va URL routelari.
- [x] **Next.js 16 & React 19**: Turbopack, 8GB RAM dev sozlalamalari.
- [ ] **Core Web Vitals**: `<img />` teglarni `next/image` ga almashtirish va LCP tezlashtirish.
- [ ] **PWA & Offline Mode**: Oflayn rejimida qulay ishlash sahifasi va manifest fayli.

---

*Eslatma: Ushbu vazifalar bajarilgach, ro'yxat `- [x]` shaklida yangilab boriladi.*
