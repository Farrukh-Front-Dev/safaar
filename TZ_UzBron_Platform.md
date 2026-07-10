# TEXNIK TOPSHIRIQ (TZ)
## "SAFAAR.uz" — O'zbekiston Milliy Turar Joy va Bron Platformasi
### Mehmonxona | Dacha | Gostinka | Sanatoriy | Tog' oromgohlari | Avtobus

---

## 1. LOYIHA HAQIDA UMUMIY MA'LUMOT

**Loyiha nomi:** SAFAAR.uz  
**Tagline:** "Bron qil, yo'lga chiq!"  
**Maqsad:** O'zbekistonning shahar mehmonxonalaridan tortib tog' bag'ridagi eng chekka oromgohlargacha bo'lgan barcha dam olish joylarini birinchi marta bitta raqamli platformada, mahalliy to'lov va SMS-xabarnoma tizimi bilan birlashtiruvchi loyiha.  
**Til:** O'zbek, Rus, Ingliz  
**Valyuta:** UZS (so'm)  
**To'lov tizimi:** Click, Payme, Uzcard, Humo, naqd to'lov  

### Muammo

- Ko'plab mehmonxona, dacha, gostinka uy va tog' bag'ridagi dam olish maskanlarining onlayn bron tizimi umuman yo'q — faqat telefon orqali "joy bormi" deb so'rash amaliyoti davom etmoqda
- Turistlar narxlar, chegirmalar va mavjud joylar haqida tarqoq, tekshirilmagan ma'lumotga tayanadi (ijtimoiy tarmoq e'lonlari, og'zaki tavsiya)
- Chekka hududlardagi (tog' etaklari, milliy bog'lar yaqinidagi, suv omborlari bo'yidagi) dam olish maskanlari raqamli xaritada deyarli ko'rinmaydi
- Mavjud xalqaro bron platformalari mahalliy to'lov tizimlari (UzCard/Humo, Click, Payme) bilan chuqur integratsiyalashmagan va O'zbekiston tilida ishlamaydi
- 80% mehmonxonalarning bron telefon yoki shaxsan qabul qilinadi
- 0% onlayn avtobus bron imkoniyati — faqat kassada
- 15% onlayn bron ulushi — 85% hali an'anaviy

### Yechim

SAFAAR shahar mehmonxonalari bilan cheklanmaydi — u O'zbekistondagi HAR TURDAGI dam olish joyini qamrab oladi:

| Tur | Tavsif |
|---|---|
| Shahar mehmonxonalari | 1–5 yulduzli mehmonxonalar, butik mehmonxonalar |
| Dacha va shaxsiy uy-hovlilar | Dam olish uylari, bog'li joylar |
| Gostinka uylar (guesthouse) | Oilaviy mehmonxonalar, arzon turar joy |
| Sanatoriy va salomatlik maskanlari | Davolash va dam olish komplekslari |
| Tog' bag'ridagi oromgohlar | Alp lodge, glamping, turistik bazalar |
| Suv omborlari bo'yidagi maskanlar | Chorvoq, Aydarkul va boshqa suv bo'yidagi dam olish joylari |
| Turistik tajriba va ekskursiyalar | Mahalliy gidlar, sayohat paketlari |
| **Avtobus chiptalari (qo'shimcha)** | Shaharlararo avtobus yo'nalishlari |

### Afzalliklar

1. Mahalliy tilda (o'zbek, rus, ingliz) to'liq interfeys
2. UzCard, Humo, Click, Payme bilan to'g'ridan-to'g'ri to'lov integratsiyasi
3. Mehmonxonalar uchun mahalliy PMS bilan avtomatik kanal-menejer integratsiyasi
4. Har qanday hajmdagi ob'ekt uchun ochiq — yirik mehmonxonadan tortib bitta xonali gostinka uygacha
5. Onlayn bron + bekor qilish siyosati shaffofligi, 24/7 mahalliy qo'llab-quvvatlash

---

## 2. TIZIM ARXITEKTURASI

Platforma **3 ta alohida mustaqil sayt**dan iborat:

```
┌─────────────────────────────────────────────────────────┐
│                   SAFAAR Ekotizimi                       │
│                                                          │
│  1. safaar.uz            — Mijozlar sayti (User Web App)│
│  2. partner.safaar.uz   — Hamkorlar kabineti           │
│  3. admin.safaar.uz     — Super Admin Dashboard        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. PANEL 1: USER WEB APP (Mijozlar Sayti)
**Domen:** `safaar.uz`

### 3.1 Sahifalar ro'yxati

#### 🏠 Bosh sahifa
- Hero banner — qidiruv bloki (turar joy asosiy, avtobus qo'shimcha tab)
- Chegirmadagi takliflar (deals)
- Tanlangan mehmonxona va dam olish maskanlari (featured)
- Mashhur yo'nalishlar (Toshkent, Samarqand, Buxoro, Xiva, Chorvoq, Chimgan...)
- Hamkorlar logolari
- Foydalanuvchi sharhlari
- Ishonch qatori (statistika: ob'ektlar, shaharlar, reyting)

#### 🔍 Qidiruv & Filter sahifasi

**Turar joy uchun (asosiy):**
- Shahar / hudud tanlash
- Kirish va chiqish sanasi
- Mehmonlar soni
- Filter: narx oralig'i, yulduzlar, turar joy turi (mehmonxona/dacha/gostinka/sanatoriy/oromgoh), qulay imkoniyatlar, reyting
- Saralash: narx ↑↓, reyting, masofa
- Xaritada ko'rish

**Avtobus uchun (qo'shimcha):**
- Ketish shahri → Borish shahri
- Sana
- O'rindiq soni

#### 📄 Xizmat tafsilotlari sahifasi

**Turar joy:**
- Foto galereya (slider)
- Xona turlari va narxlar
- Qulayliklar ro'yxati (Wi-Fi, hovuz, parking, nonushta...)
- Xarita (joylashuv)
- Mehmon sharhlari va reytingi
- "Bron qilish" tugmasi

**Avtobus:**
- Marshrut va to'xtash joylari
- Jo'nash / kelish vaqti
- O'rindiq sxemasi (interaktiv tanlov)

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
| Xarita integratsiyasi | Google Maps / Yandex Maps |
| Push bildirishnomalar | Bron holati yangilanishi |
| Multi-til | O'zbek / Rus / Ingliz |
| Responsiv dizayn | Mobile-first |
| PWA | Ilovaga o'xshash tajriba |

---

## 4. PANEL 2: PARTNER PANEL (Hamkorlar Kabineti)
**Domen:** `partner.safaar.uz`

Ushbu panel mehmonxona egalari, dacha va gostinka uy egalari, sanatoriyalar, tog' oromgohlari va avtobus kompaniyalari uchun mo'ljallangan.

### 4.1 Ro'yxatdan o'tish va tasdiqlash
- Kompaniya ma'lumotlari kiriting
- Ob'ekt turini tanlash (mehmonxona / dacha / gostinka / sanatoriy / oromgoh / avtobus)
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

**Turar joy hamkori uchun:**
- Xona / uy qo'shish / tahrirlash / o'chirish
- Ob'ekt turlari (standart, lyuks, suite, butun uy...)
- Narxlar kalendari (dinamik narxlash)
- Mavjudlik boshqaruvi (real-time)
- Rasm yuklash
- Qulayliklar belgilash

**Avtobus kompaniyasi uchun:**
- Marshrut qo'shish
- Avtobus parki boshqaruvi
- Reys jadvalini kiritish
- O'rindiq sxemasini sozlash
- Narx belgilash

### 4.4 Bronlar boshqaruvi
- Barcha bronlar (kutilmoqda / tasdiqlangan / bekor qilingan)
- Bron tasdiqlash yoki rad etish
- Mijoz bilan bog'lanish (chat / qo'ng'iroq)
- Bron tarixi eksport (Excel / PDF)

### 4.5 Moliya
- Daromad hisoboti (kunlik / oylik / yillik)
- To'lovlar holati
- Komissiya hisobi (SAFAAR foizi)
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

---

## 5. PANEL 3: SUPER ADMIN DASHBOARD (Boshqaruv Paneli)
**Domen:** `admin.safaar.uz`

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
- Turar joy kategoriyalari (mehmonxona, dacha, gostinka, sanatoriy, oromgoh)
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

## 6. TEXNIK STACK

### Frontend
| Qism | Texnologiya |
|---|---|
| Framework | Next.js 16 (React 19) |
| UI Library | Tailwind CSS v4 |
| State management | React Server Components + Client Components |
| Xarita | Google Maps API / Yandex Maps |
| Grafiklar | Recharts / Chart.js |

### Backend
| Qism | Texnologiya |
|---|---|
| API | NestJS |
| Ma'lumotlar bazasi | PostgreSQL |
| Cache | Redis |
| File storage | AWS S3 / Yandex Object Storage |
| Auth | JWT + Refresh Token |
| SMS | Eskiz.uz / PlayMobile |

### DevOps
| Qism | Texnologiya |
|---|---|
| Server | VPS / Railway |
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

---

## 9. MOBILLIK

- User Web App: **PWA** (Progressive Web App) — telefonga o'rnatish mumkin
- Kelajakda: **React Native** — iOS va Android ilovalar
- Admin va Partner Panel: faqat desktop (responsive tablet)

---

## 10. BIZNES MODELI

| Manba | Tavsif |
|---|---|
| Bron komissiyasi | Har bir muvaffaqiyatli brondan 8–12% |
| Premium obuna | Hamkorlar uchun kengaytirilgan statistika va ustuvor ko'rinish |
| SMS-chegirma obuna | Foydalanuvchilar uchun oylik obuna (chegirmalar haqida SMS-xabarnoma) |
| Reklama | Mahalliy bizneslar uchun targetli reklama |
| Korporativ paket (B2B) | Kompaniyalar uchun xodimlar safarini boshqarish |

---

## 11. YO'L XARITASI (ROADMAP)

| Bosqich | Muddat | Tarkib |
|---|---|---|
| **MVP** | Q4 2026 | Samarqand pilot (200+ ob'ekt), mehmonxona bron, partner panel, admin dashboard |
| **Beta** | Q1 2027 | Toshkent, Buxoro, Chorvoq — to'liq qamrov, avtobus bron, Click & Payme |
| **Kengayish** | Q2 2027 | Xiva, Zomin, Amirsoy, Farg'ona vodiysi, multi-til, PWA, SMS OTP |
| **Milliy qamrov** | Q3–Q4 2027 | 14 viloyat to'liq qamrov, mobil ilovalar, AI tavsiyalar |

---

## 12. SAHIFALAR SONI JAMI

| Panel | Sahifalar soni |
|---|---|
| User Web App | ~15 sahifa |
| Partner Panel | ~12 sahifa |
| Super Admin | ~18 sahifa |
| **Jami** | **~45 sahifa** |

---

## 13. DIZAYN TALABLARI

- **Stil:** Zamonaviy, professional, O'zbekistonga xos ranglar (ko'k, yashil)
- **Logo:** SAFAAR brendi
- **Shriftlar:** O'zbek kirill va lotin alifbosini qo'llab-quvvatlash
- **Ikonkalar:** Lucide
- **Dark mode:** Ixtiyoriy
- **Yuklanish tezligi:** Core Web Vitals — yaxshi ko'rsatkichlar

---

*Hujjat versiyasi: 2.0 | Sana: 2026-yil iyul*  
*Tayyorladi: SAFAAR Development Team*
