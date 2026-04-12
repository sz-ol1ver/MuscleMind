# MuscleMind
Vizsgaremek


**Csapattagok:**
```
Tamás Dávid
Szalontai Olivér
```

```
musclemind/
├─ backend/
│  ├─ api/
│  │  ├─ api.js                        # közös API logika / helper függvények
│  │  ├─ auth.routes.js                # bejelentkezés, regisztráció, session kezelés
│  │  ├─ questionnaire.routes.js       # kérdőív API végpontok
│  │  ├─ workout.routes.js             # edzéstervek kezelése
│  │  ├─ meal.routes.js                # étrend / ételek API
│  │  ├─ stats.routes.js               # statisztikák és progress adatok
│  │  ├─ profile.routes.js             # felhasználó profil kezelése
│  │  ├─ ranglist.routes.js            # ranglista és közösségi adatok
│  │  └─ admin.routes.js               # admin API
│  │
│  ├─ middleware/
│  │  ├─ is-auth.middleware.js         # csak belépett user mehet tovább
│  │  ├─ is-guest.middleware.js        # ha már be van lépve ne mehessen loginra
│  │  ├─ registration-complete.middleware.js # kérdőív / regisztráció 2. rész ellenőrzése
│  │  ├─ is-admin.middleware.js        # admin jogosultság
│  │  ├─ kerdoiv.middleware.js         # kérdőív kitöltés ellenőrzés
│  │  ├─ login.middleware.js           # session ellenőrzés
│  │  └─ registration.middleware.js    # regisztráció állapot ellenőrzése
│  │
│  ├─ sql/
│  │  ├─ database.js                   # MySQL kapcsolat
│  │  ├─ database.sql                  # teljes adatbázis séma
│  │  └─ db_quick.sql                  # tesztadatok / seed
│  │
│  ├─ http/
│  │  └─ test.http                     # REST Client API teszt
│  │
│  ├─ node_modules/                    # npm csomagok
│  │
│  ├─ nodemon.json                     # nodemon config
│  ├─ package.json                     # dependency-k
│  ├─ package-lock.json
│  └─ server.js                        # Express szerver
│
├─ frontend/
│  ├─ html/
│  │  ├─ index.html                    # dashboard
│  │  ├─ login.html                    # login
│  │  ├─ registration.html             # regisztráció
│  │  ├─ questionnaire.html            # kérdőív
│  │  ├─ profile.html                  # profil
│  │  ├─ workout.html                  # edzéstervek
│  │  ├─ userWorkout.html              # saját edzések
│  │  ├─ meals.html                    # étrend
│  │  ├─ stats.html                    # statisztikák
│  │  ├─ ranglist.html                 # ranglista
│  │  └─ admin.html                    # admin felület
│  │
│  ├─ javascript/
│  │  ├─ api.js                        # frontend fetch wrapper
│  │  ├─ login.js                      # login logika
│  │  ├─ register.js                   # regisztráció logika
│  │  ├─ question.js                   # kérdőív logika
│  │  ├─ index.js                      # dashboard működés
│  │  ├─ profile.js                    # profil JS
│  │  ├─ workout.js                    # edzéstervek kezelése
│  │  ├─ userWorkout.js                # user edzések
│  │  ├─ meals.js                      # étrend logika
│  │  ├─ stats.js                      # statisztikák
│  │  ├─ ranglist.js                   # ranglista logika
│  │  ├─ admin.js                      # admin JS
│  │  └─ loading-overlay.js            # globális loading overlay
│  │
│  ├─ css/
│  │  ├─ forms.css
│  │  ├─ index.css
│  │  ├─ profile.css
│  │  ├─ questionnaire.css
│  │  ├─ workout.css
│  │  ├─ userWorkout.css
│  │  ├─ ranglist.css
│  │  ├─ admin.css
│  │  └─ background-res.css
│  │
│  ├─ images/                          # képek / assetek
│  ├─ bootstrap/                       # bootstrap lokális fájlok
│  └─ favicon.ico
│
├─ .prettierrc                         # prettier szabályok
├─ .gitattributes                      # git fájlkezelési beállítások
├─ .gitignore                          # ignorált fájlok
├─ readme.md                           # dokumentáció
└─ README.md                           # fő readme

brevo api - https://api.brevo.com/v3/smtp/email
chart - https://www.chartjs.org/docs/latest/getting-started/
