# Safaar — Boshqa Dasturchilar Uchun Topshiriqlar va So'rovlar (DEV_REQUESTS)

> **Maqsad:** Frontend (`web-user`) ishini to'liq yakunlash va platforma integratsiyasini ta'minlash uchun **Backend**, **Partner** va **Admin** dasturchilaridan talab qilinadigan API endpoints, turlar va sozlamalar ro'yxati.
> **Status:** Faol (Har bir dasturchi o'z qismini bajargach `- [x]` belgilaydi)

---

## 1. 🛠️ Backend Dasturchisi Uchun (`apps/backend/` va `packages/types/` — @Lazizdeveloper)

### 🔑 1.1. SMS OTP va Autentifikatsiya API
- [ ] **`POST /api/auth/send-otp`**: Foydalanuvchi telefon raqamiga 6 xonali SMS OTP kod yuborish (`phone: string`).
- [ ] **`POST /api/auth/verify-otp`**: Kiritilgan OTP kodni tekshirish va JWT tokenlarni (`accessToken`, `refreshToken`) qaytarish.
- [ ] **`POST /api/auth/refresh`**: Refresh token orqali yangi access token olish.

### 💳 1.2. Mahalliy To'lov Tizimlari Integratsiyasi (Click, Payme, Uzcard)
- [ ] **`POST /api/payments/click/prepare`**: Click Merchant API uchun checkout URL va tranzaksiya ID shakllantirish.
- [ ] **`POST /api/payments/payme/prepare`**: Payme Merchant API uchun to'lov havolasini shakllantirish.
- [ ] **`POST /api/payments/webhook/click`** & **`payme`**: Webhook callbacklarini qabul qilish hamda bron statusini `CONFIRMED` holatiga o'tkazish.

### 🚌 1.3. Avtobus Chiptalari va Joylar (Seats) API
- [ ] **`GET /api/buses/:tripId/seats`**: Tanlangan avtobus reysi bo'yicha band va bo'sh o'rinlar (seat numbers) ro'yxatini qaytarish.
- [ ] **`POST /api/buses/book-seats`**: Tanlangan joylarni bron qilish hamda chipta generatsiya qilish.

### ⭐ 1.4. Sharhlar va Keshbek / Bonuslar
- [ ] **`POST /api/hotels/:id/reviews`**: Muvaffaqiyatli bronni yakunlagan foydalanuvchilar uchun sharh va reyting (1-5 yulduz) qoldirish API.
- [ ] **`GET /api/users/me/bonuses`**: Foydalanuvchining to'plangan bonus ballari va keshbek tarixini olish.

---

## 2. 🤝 Web-Partner Dasturchisi Uchun (`apps/web-partner/` — @adhambek7717)

- [ ] **Xonalar va Narxlar Sinxronizatsiyasi**: Hamkor kabinetida xona narxi yoki bandlik sanasi o'zgarganda backend API orqali real-time `web-user` da aks etishini ta'minlash.
- [ ] **Mehmonxona Rasmlari**: Hamkorlar tomonidan yuklanadigan rasmlar sifati va `imageUrl` larini to'g'ri shaklda backendga yuborish.

---

## 3. 🛡️ Web-Admin Dasturchisi Uchun (`apps/web-admin/` — @adhambek7717 / @scarygun)

- [ ] **Moderatsiya va Tasdiq**: Yangi hamkor mehmonxonalarini moderatsiyadan o'tkazish (Pending ➔ Approved) va `web-user` qidiruv katalogida ko'rinishini faollashtirish.

---

*Eslatma: Backend va boshqa dasturchilar topshiriqni yakunlagach, shu fayldagi mos katakchani `- [x]` qilib statusni yangilaydi.*
