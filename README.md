# MuscleMind
Vizsgaremek

musclemind/
├─ backend/
│  ├─ api/
│  │  ├─ auth.routes.js          # bejelentkezés, regisztráció
│  │  ├─ user.routes.js          # profil, kérdőív, felhasználói adatok
│  │  ├─ workout.routes.js       # edzéstervek kezelése
│  │  ├─ meal.routes.js          # receptek, ételajánló
│  │  ├─ stats.routes.js         # statisztikák, progress
│  │  ├─ friends.routes.js       # barátlista, ranglista
│  │  └─ admin.routes.js         # admin funkciók
│  │
│  ├─ middleware/
│  │  ├─ auth.middleware.js      # JWT alapú jogosultság ellenőrzés
│  │  └─ admin.middleware.js     # admin jogosultság ellenőrzés
│  │
│  ├─ sql/
│  │  ├─ database.js             # adatbázis kapcsolat
│  │  ├─ user.model.js           # felhasználók
│  │  ├─ workout.model.js        # edzéstervek
│  │  ├─ meal.model.js           # ételek, receptek
│  │  ├─ stats.model.js          # statisztikai adatok
│  │  └─ friends.model.js        # barátrendszer, ranglista
│  │
│  ├─ uploads/                   # feltöltött fájlok
│  ├─ server.js                  # Express szerver belépési pont
│  ├─ nodemon.json
│  ├─ package.json
│  └─ package-lock.json
│
├─ frontend/
│  ├─ html/
│  │  ├─ login.html              # bejelentkezés
│  │  ├─ register.html           # regisztráció
│  │  ├─ questionnaire.html      # kezdeti kérdőív
│  │  ├─ index.html              # főoldal / dashboard
│  │  ├─ workout.html            # edzéstervek
│  │  ├─ meals.html              # receptek, ételajánló
│  │  ├─ profile.html            # felhasználói profil
│  │  ├─ friends.html            # barátlista, ranglista
│  │  ├─ calendar.html           # naptár, emlékeztetők
│  │  └─ admin.html              # admin felület
│  │
│  ├─ javascript/
│  │  ├─ auth.js                 # token kezelés, belépés ellenőrzés
│  │  ├─ api.js                  # backend API hívások
│  │  ├─ login.js
│  │  ├─ register.js
│  │  ├─ questionnaire.js
│  │  ├─ index.js
│  │  ├─ workout.js
│  │  ├─ meals.js
│  │  ├─ profile.js
│  │  ├─ friends.js
│  │  ├─ calendar.js
│  │  └─ admin.js
│  │
│  ├─ css/
│  │  ├─ index.css
│  │  ├─ auth.css
│  │  ├─ dashboard.css
│  │  └─ admin.css
│  │
│  ├─ images/
│  ├─ bootstrap/
│  │  ├─ css/
│  │  └─ js/
│  └─ favicon.ico
│
├─ .gitignore
├─ .prettierrc
└─ README.md
