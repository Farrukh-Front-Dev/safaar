# UzBron — Ishlash qoidalari (CONTRIBUTING)

Bu fayl jamoaning yagona ish qo'llanmasi. Har bir dasturchi (va uning AI agenti)
shu qoidalarga amal qiladi.

---

## 1. Kim qayerda ishlaydi (egalik)

Har bir dasturchi **faqat o'z papkasida** ishlaydi. To'liq jadval — `CODEOWNERS`.

| Dasturchi | Papka | Port |
|---|---|---|
| @Farrukh-Front-Dev | `apps/web-user/`    | 3000 |
| @adhambek7717      | `apps/web-partner/` | 3001 |
| @scarygun          | `apps/web-admin/`   | 3002 |
| @Lazizdeveloper    | `apps/backend/` + `packages/types/` | 4000 |

**Chegara qoidasi:**
- O'z papkangda — ✅ bemalol o'qi va yoz.
- `apps/backend/` va `packages/types/` — 📖 faqat **o'qish** (API va turlarni tushunish).
- Boshqa frontend papkalari — ⛔ umuman tegma.
- Yangi tur/endpoint kerak bo'lsa — o'zing qo'shma, **backend dev'dan so'ra**.

---

## 2. Branch va ish oqimi

Har kim o'z branch'ida ishlaydi. **`main`'ga to'g'ridan-to'g'ri push qilinmaydi** —
faqat PR (Pull Request) orqali.

### Asosiy qoida
> **Bitta sahifa / bir o'tirgandagi ishni tugatgach — push qil va PR och.**
> Hammasini oxirigacha yig'ib qo'yma. Har bir mantiqiy bo'lak alohida PR bo'lsin.
> Maqsad: PR kichik bo'lsin (1-2 kunlik ishdan oshmasin), review oson bo'lsin.

### Branch nomlash
```
feature/<qisqa-tavsif>    # yangi funksiya/sahifa, masalan: feature/user-qidiruv
fix/<qisqa-tavsif>        # xato tuzatish, masalan: fix/checkout-xato
```

### Qadamlar (bir sahifa/ish uchun)
```bash
# 1. Eng yangi main'ni ol
git checkout main && git pull

# 2. Yangi branch och
git checkout -b feature/user-qidiruv

# 3. O'z papkangda ishla (AI'ni shu papkadan ishga tushir)
cd apps/web-user && claude

# 4. Sahifa/ish tugagach — commit va push
git add .
git commit -m "feat(web-user): qidiruv sahifasi"
git push -u origin feature/user-qidiruv

# 5. GitHub'da PR och: feature/... -> main
#    Papka egasi (CODEOWNERS) review qiladi -> tasdiqlaydi -> merge
#    Merge'dan keyin branch o'chiriladi
```

### Merge qayerga?
Barcha feature branch'lar **`main`'ga** merge qilinadi (PR + review orqali).
`main` doim toza va ishlaydigan holatda turadi.

---

## 3. Commit xabarlari

Qisqa, aniq, ish tilida. Tavsiya format (Conventional Commits):
```
feat(web-user): bosh sahifa hero bloki
fix(backend): bron statusi xatosi
chore: bog'liqliklarni yangilash
```

---

## 4. Har bir o'zgartirishdan oldin (majburiy)

```bash
npm run build    # o'z app'ingda — xatosiz bo'lsin
npm run lint     # frontend uchun
npm run test     # backend uchun
```
Yashil bo'lmasa — PR ochma, avval tuzat.

---

## 5. `@agoda/types` (shartnoma) bilan ishlash

- API javob turlarini doim `@agoda/types`'dan import qil — qo'lda yozma.
- Bu paketni faqat **backend dev** o'zgartiradi.
- Backend yangi tur qo'shsa: `npm run build:types` (dist yangilanadi), keyin
  frontend'da avtomatik paydo bo'ladi.

---

## 6. Birinchi marta sozlash (har bir dev)

```bash
git clone git@github.com:Startup-loyihalar/agoda_frontend_backend.git
cd agoda_frontend_backend
npm install
npm run build:types     # MAJBURIY — birinchi shu

npm run dev:user        # yoki dev:partner / dev:admin / dev:backend
```

---

## Qisqa eslatma

1. O'z papkangda ishла, boshqasiga tegma.
2. Har bir sahifa/ish tugagach — branch'dan `main`'ga PR.
3. PR kichik bo'lsin, build/test yashil bo'lsin.
4. `main`'ga to'g'ridan-to'g'ri push yo'q.
