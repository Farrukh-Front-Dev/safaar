# TEXNIK TOPSHIRIQ (TZ)
## "UzBron" — O'zbekiston Bron Qilish Platformasi
### Mehmonxona | Avtobus

---

## 1. LOYIHA HAQIDA UMUMIY MA'LUMOT

**Loyiha nomi:** UzBron.uz  
**Maqsad:** O'zbekiston bo'ylab mehmonxona va avtobus xizmatlarini onlayn bron qilish imkonini beruvchi milliy platforma  
**Prototip:** Agoda.com (xalqaro sayti)  
**Til:** O'zbek, Rus, Ingliz  
**Valyuta:** UZS (so'm)  
**To'lov tizimi:** Click, Payme, Uzcard, Humo, naqd to'lov  

---

## 2. TIZIM ARXITEKTURASI

Platforma **3 ta alohida mustaqil sayt**dan iborat:

```
┌─────────────────────────────────────────────────────────┐
│                    UzBron Ekotizimi                      │
│                                                          │
│  1. uzbron.uz         — Mijozlar sayti (User Web App)   │
│  2. partner.uzbron.uz — Hamkorlar kabineti              │
│  3. admin.uzbron.uz   — Super Admin Dashboard           │
└─────────────────────────────────────────────────────────┘
```

---

## 3. PANEL 1: USER WEB APP (Mijozlar Sayti)
**Domen:** `uzbron.uz`

### 3.1 Sahifalar ro'yxati

#### 🏠 Bosh sahifa
- Hero banner — qidiruv bloki (mehmonxona / avtobus tabs)
- Mashhur yo'nalishlar (Toshkent, Samarqand, Buxoro, Xiva...)
- Chegirmadagi takliflar
- Hamkorlar logolari
- Foydalanuvchi sharhlari

#### 🔍 Qidiruv & Filter sahifasi
**Mehmonxona uchun:**
- Shahar / hudud tanlash
- Kirish va chiqish sanasi
- Mehmonlar soni (kattalar / bolalar)
- Filter: narx oralig'i, yulduzlar, qulay imkoniyatlar, reyting
- Saralash: narx ↑↓, reyting, masofа

**Avtobus uchun:**
- Ketish shahri → Borish shahri
- Sana va vaqt
- O'rindiq soni
- Filter: avtobus turi (lüks, oddiy), narx, jo'nash vaqti

#### 📄 Xizmat tafsilotlari sahifasi
**Mehmonxona:**
- Foto galereyа (slider)
- Xona turlari va narxlar
- Qulayliklar ro'yxati (Wi-Fi, hovuz, parking...)
- Xarita (joylashuv)
- Mehmon sharhlari va reytingi
- "Bron qilish" tugmasi

**Avtobus:**
- Marshrut va to'xtash joylari
- Jo'nash / kelish vaqti
- O'rindiq sxemasi (interaktiv tanlov)
- Avtobus tavsifi

#### 🛒 Bron qilish jarayoni (Checkout)
1. Ma'lumotlarni kiriting (ism, telefon, email)
2. To'lov usulini tanlang
3. Tasdiqlash (SMS OTP)
4. Bron tasdiqlanishi (email + SMS)

#### 👤 Shaxsiy kabinet
- Profil tahrirlash
- Joriy bronlar
- Bronlar tarixi
- Sevimlilar ro'yxati
- Bonuslar va chegirmalar
- Shikoyat va murojaat

#### 📱 Qo'shimcha sahifalar
- Haqimizda
- Aloqa
- FAQ
- Shartlar va qoidalar
- Maxfiylik siyosati

### 3.2 Funksional talablar
| Funksiya | Tavsif |
|---|---|
| Ro'yxatdan o'tish | Telefon raqam + SMS OTP |
| Ijtimoiy kirish | Google, Facebook |
| Xaritа integratsiyasi | Google Maps / Yandex Maps |
| Push bildirishnomalar | Bron holati yangilanishi |
| Multi-til | O'zbek / Rus / Ingliz |
| Responsiv dizayn | Mobile-first |
| PWA | Ilovaga o'xshash tajriba |

---

## 4. PANEL 2: HOTEL PANEL (Hamkorlar Kabineti)
**Domen:** `partner.uzbron.uz`

Ushbu panel mehmonxona egalari va avtobus kompaniyalari uchun mo'ljallangan.

### 4.1 Ro'yxatdan o'tish va tasdiqlash
- Kompaniya ma'lumotlari kiriting
- Hujjat yuklash (litsenziya, soliq guvohnomasi)
- Admin tomonidan tasdiqlash (1-3 ish kuni)
- Kirish ma'lumotlari emailga yuboriladi

### 4.2 Dashboard (Bosh panel)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Bugungi     │  Bu oydagi   │  Umumiy      │  Reyting     │
│  bronlar: 12 │  daromad     │  mijozlar    │  ⭐ 4.7       │
│              │  2,400,000 so│  1,234       │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

- Bronlar grafigi (kunlik / haftalik / oylik)
- Oxirgi bronlar ro'yxati
- Tezkor harakatlar

### 4.3 Xizmatlarni boshqarish

**Mehmonxona hamkori uchun:**
- Xona qo'shish / tahrirlash / o'chirish
- Xona turlari (standart, lyuks, suite...)
- Narxlar kalendari (dinamik narxlash)
- Mavjudlik boshqaruvi (real-time)
- Rasm yuklash
- Qulayliklar belgilash

**Avtobus kompaniyasi uchun:**
- Marshrut qo'shish
- Avtobus parki boshqaruvi
- Reys jadvalini kiritish
- O'rindiq sxemasini sozlash
- Narx belgilash (oddiy / bayram)

### 4.4 Bronlar boshqaruvi
- Barcha bronlar (kutilmoqda / tasdiqlangan / bekor qilingan)
- Bron tasdiqlash yoki rad etish
- Mijoz bilan bog'lanish (chat / qo'ng'iroq)
- Bron tarixi eksport (Excel / PDF)

### 4.5 Moliya
- Daromad hisoboti (kunlik / oylik / yillik)
- To'lovlar holati
- Komissiya hisobi (UzBron foizi)
- To'lov so'rash (pul yechib olish)
- Cheklar va hujjatlar

### 4.6 Sharhlar va reyting
- Mijozlar sharhlari
- Reytingga javob berish
- Reyting statistikasi

### 4.7 Sozlamalar
- Profil ma'lumotlari
- Bank rekvizitlari
- Bildirishnoma sozlamalari
- Parol o'zgartirish
- API integratsiya (ilg'or hamkorlar uchun)

---

## 5. PANEL 3: SUPER ADMIN DASHBOARD (Boshqaruv Paneli)
**Domen:** `admin.uzbron.uz`

Faqat platforma ma'murlari uchun. To'liq nazorat va boshqaruv.

### 5.1 Dashboard (Bosh panel)
```
┌───────────┬───────────┬───────────┬───────────┬───────────┐
│  Jami     │  Faol     │  Bugungi  │  Oylik    │  Yillik   │
│  foyda-   │  hamkor-  │  bronlar  │  daromad  │  foyda    │
│  lanuvchi │  lar      │           │           │           │
│  45,230   │  320      │  1,240    │  85 mln   │  980 mln  │
└───────────┴───────────┴───────────┴───────────┴───────────┘
```

- Real-time statistika grafiklar
- Xaritada faollik (viloyatlar bo'yicha)
- So'nggi harakatlar lenti

### 5.2 Foydalanuvchilar boshqaruvi
- Barcha ro'yxatdan o'tgan foydalanuvchilar
- Qidirish va filtrlash
- Foydalanuvchi tafsilotlari ko'rish
- Blok / razblok
- Shikoyatlar ko'rish
- Bonus/chegirma berish

### 5.3 Hamkorlar boshqaruvi
- Yangi arizalar (tasdiqlash / rad etish)
- Barcha hamkorlar ro'yxati
- Hamkor profilini ko'rish va tahrirlash
- Hamkorni to'xtatib qo'yish / o'chirish
- Komissiya foizini belgilash
- Hujjatlar ko'rish

### 5.4 Bronlar boshqaruvi
- Barcha bronlar (barcha hamkorlar bo'yicha)
- Qidirish (ID, ism, telefon, sana)
- Bron tafsilotlari
- Bron bekor qilish (admin huquqi)
- Qaytarish (refund) tasdiqlash
- Eksport (Excel, CSV)

### 5.5 Moliya va hisobotlar
- Umumiy daromad hisoboti
- Hamkorlar bo'yicha daromad
- Komissiya hisobi
- To'lov so'rovlari (hamkorlar)
- To'lovni tasdiqlash / rad etish
- Soliq hisobotlari
- Grafik va vizualizatsiyalar

### 5.6 Kontent boshqaruvi (CMS)
- Bosh sahifa bannerlari
- Maxsus takliflar va aksiyalar
- Yangiliklar va e'lonlar
- FAQ tahrirlash
- Sahifalar (Haqimizda, Shartlar...)
- Email va SMS shablonlar

### 5.7 Kategoriyalar va manzillar
- Shaharlar va viloyatlar boshqaruvi
- Marshrut kategoriyalari
- Xona turlari
- Qulayliklar katalogi

### 5.8 Chegirma va promo-kodlar
- Promo-kod yaratish
- Chegirma shartlari (foiz / summa)
- Amal qilish muddati
- Foydalanish statistikasi
- Ro'yxatdan o'tgan foydalanuvchilarga maxsus chegirma

### 5.9 Shikoyatlar va yordam
- Barcha murojaat va shikoyatlar
- Holat: yangi / jarayonda / yopilgan
- Javob yozish
- Hamkorga yo'naltirish
- Statistika

### 5.10 Tizim sozlamalari
- Sayt sozlamalari (nomi, logotipi, aloqa)
- To'lov tizimlari integratsiyasi (Click, Payme)
- SMS provider sozlamalari
- Email sozlamalari (SMTP)
- Adminlar boshqaruvi (rol va huquqlar)
- Audit log (kim nima qildi)
- Backup va xavfsizlik

---

## 6. TEXNIK STACK (Tavsiya etilgan)

### Frontend
| Qism | Texnologiya |
|---|---|
| Framework | Next.js 14 (React) |
| UI Library | Tailwind CSS + Shadcn/ui |
| State management | Zustand / Redux Toolkit |
| Xarita | Google Maps API / Yandex Maps |
| Grafiklar | Recharts / Chart.js |

### Backend
| Qism | Texnologiya |
|---|---|
| API | Node.js + Express / NestJS |
| Ma'lumotlar bazasi | PostgreSQL |
| Cache | Redis |
| File storage | AWS S3 / Yandex Object Storage |
| Auth | JWT + Refresh Token |
| SMS | Eskiz.uz / PlayMobile |

### DevOps
| Qism | Texnologiya |
|---|---|
| Server | VPS / Kubernetes |
| CDN | Cloudflare |
| CI/CD | GitHub Actions |
| Monitoring | Grafana + Prometheus |

---

## 7. API INTEGRATSIYALAR

| Xizmat | Maqsad |
|---|---|
| Click API | To'lov qabul qilish |
| Payme API | To'lov qabul qilish |
| Uzcard / Humo | Karta to'lovlari |
| Eskiz.uz / PlayMobile | SMS OTP yuborish |
| Google Maps API | Xarita va navigatsiya |
| Google / Facebook OAuth | Ijtimoiy kirish |
| Firebase | Push bildirishnomalar |

---

## 8. XAVFSIZLIK TALABLARI

- HTTPS (SSL/TLS) — barcha saytlarda majburiy
- SMS OTP — telefon tasdiqlash
- JWT + Refresh Token — autentifikatsiya
- Rate limiting — brute-force himoya
- SQL injection himoya (ORM orqali)
- XSS himoya
- CORS sozlamalari
- Admin panelga IP restriction (ixtiyoriy)
- Audit log — barcha harakatlar yozib boriladi
- GDPR-ga o'xshash ma'lumot himoyasi

---

## 9. MOBILLIK

- User Web App: **PWA** (Progressive Web App) — telefonga o'rnatish mumkin
- Kelajakda: **React Native** — iOS va Android ilovalar
- Admin va Hotel Panel: faqat desktop (responsive tablet)

---

## 10. LOYIHA BOSQICHLARI

| Bosqich | Muddat | Tarkib |
|---|---|---|
| **1. MVP** | 3 oy | User Web App (mehmonxona bron), Hotel Panel (asosiy), Admin (asosiy) |
| **2. Beta** | +2 oy | Avtobus bron, to'lov tizimlari, SMS |
| **3. Full** | +2 oy | Mobile app, kengaytirilgan hisobotlar, avtobus kengaytirish |
| **4. Scale** | Davomiy | Marketing, hamkorlar kengaytirish |

---

## 11. SAHIFALAR SONI JAMI

| Panel | Sahifalar soni |
|---|---|
| User Web App | ~15 sahifa |
| Hotel Panel | ~12 sahifa |
| Super Admin | ~18 sahifa |
| **Jami** | **~45 sahifa** |

---

## 12. DIZAYN TALABLARI

- **Stil:** Zamonaviy, professional, O'zbekistonga xos ranglar (ko'k, yashil)
- **Logo:** UzBron brendi
- **Shriftlar:** O'zbek kirill va lotin alifbosini qo'llab-quvvatlash
- **Ikonkalar:** Lucide / Heroicons
- **Dark mode:** Ixtiyoriy (Admin panel uchun)
- **Yuklanish tezligi:** Core Web Vitals — yaxshi ko'rsatkichlar

---

*Hujjat versiyasi: 1.1 | Sana: 2026-yil iyun*  
*Tayyorladi: UzBron Development Team*
