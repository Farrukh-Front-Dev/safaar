# Git hooks — UzBron

Bu papkadagi hook'lar repo bilan birga versiyalanadi va **avtomatik** o'rnatiladi.

## Avtomatik o'rnatish
`npm install` paytida root `package.json`'dagi `prepare` script ishlaydi va
hook'larni yoqadi:
```
git config core.hooksPath .githooks
```
Demak har bir dev `git pull` + `npm install` qilsa — hook o'zi yoqiladi,
qo'lda hech narsa qilish shart emas.

## Qo'lda yoqish (agar kerak bo'lsa)
```bash
git config core.hooksPath .githooks
chmod +x .githooks/*
```

## `pre-push` — "o'z papkangdan tashqariga tegma"
Push'dan oldin **sizning** muallifligingizdagi (merge bo'lmagan) commitlar
`CODEOWNERS`'ga solishtiriladi. O'z papkangizdan tashqaridagi fayl o'zgargan
bo'lsa — push to'xtaydi.

Tekshirilmaydi: merge commitlar (integratsiya), boshqalarning commitlari,
`package-lock.json` (avto-generatsiya).

### Zarur bo'lsa chetlab o'tish
Ataylab boshqa papkaga tegish kerak bo'lsa (papka egasi bilan kelishib):
```bash
HOOK_ALLOW_CROSS_FOLDER=1 git push
# yoki doimiy:
git config hooks.allowCrossFolder true
```

> Eslatma: bu **lokal** himoya (server emas). Repo private + Free reja
> bo'lgani uchun GitHub branch protection mavjud emas; shuning uchun lokal
> hook + CODEOWNERS + CI birgalikda ishlatiladi.
