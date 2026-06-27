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

Har bir dasturchining **bitta doimiy shaxsiy branch**i bor. U **o'chirilmaydi** —
hamma ishingiz shu branch'da davom etadi. **`main`'ga to'g'ridan-to'g'ri push
qilinmaydi** — shaxsiy branch'dan `main`'ga faqat PR (Pull Request) orqali o'tadi.

### Shaxsiy branch nomlari
```
farrukh      → @Farrukh-Front-Dev  (web-user)
adham        → @adhambek7717        (web-partner)
scarygun     → @scarygun            (web-admin)
laziz        → @Lazizdeveloper      (backend)
```

### Asosiy qoida
> **Bugungi / bir o'tirgandagi ish tugagach — o'z branch'ingga push qil.**
> Ish biror mantiqiy bosqichga yetganda (masalan, bir sahifa tayyor bo'lганda),
> `main`'ga PR och. Hammasini oxirigacha yig'ib qo'yma — tez-tez kichik PR yaxshi.

### Kundalik qadamlar
```bash
# 1. O'z shaxsiy branch'ingda ishla (bir marta yaratilgan, o'chirilmaydi)
git checkout farrukh

# 2. main'dagi yangiliklarni o'z branch'ingga ol (backend/types o'zgargan bo'lishi mumkin)
git merge main

# 3. O'z papkangda ishla (AI'ni shu papkadan ishga tushir)
cd apps/web-user && claude

# 4. Bugungi / bir o'tirgandagi ish tugagach — push
git add .
git commit -m "feat(web-user): qidiruv sahifasi"
git push

# 5. Ish bosqichi tayyor bo'lganda — GitHub'da PR och: farrukh -> main
#    Papka egasi review qiladi -> tasdiqlaydi -> main'ga merge.
#    (Branch o'chirilmaydi — keyingi ishni shu branch'da davom ettirasan.)
```

### ⚠️ Muhim — branch'ni yangilab tur
Shaxsiy branch o'chirilmagani uchun, `main`'ga merge qilingandan keyin ham,
**har safar ishni boshlashdan oldin `git merge main`** qil. Shunda branch'ing
`main`'dan uzoqlashib ketmaydi va backend/types o'zgarishlarini o'z vaqtida olasan.

### Merge qayerga?
Shaxsiy branch'lar **`main`'ga** merge qilinadi (PR + review orqali).
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
