Természetesen! Az alábbi dokumentumot úgy állítottam össze, hogy minden pontban konkrétan a MuscleMind projektedre hivatkozzon, és a vizsgán való sikeres szóbeli védéshez minden szükséges tudást, magyarázatot, példát és vizsgakérdést tartalmazzon. A dokumentum hosszú, de minden pontot részletesen kidolgoztam, hogy tanulható és átlátható legyen.

---

# MuscleMind projektvédés tanulási dokumentum

---

## 1. Projekt rövid, vizsgán elmondható összefoglalója

### 1 perces verzió

A MuscleMind egy webes alkalmazás, amely segíti a felhasználókat az egészséges életmód kialakításában, edzéstervek, étrendek és személyre szabott tanácsok segítségével. A rendszer regisztráció után kérdőívvel méri fel a felhasználó céljait, majd naptárban követhető edzéseket, recepteket és statisztikákat kínál. Fő célcsoportja azok, akik szeretnének tudatosabban sportolni és étkezni.

### 3 perces verzió

A MuscleMind célja, hogy egy helyen biztosítson minden fontos funkciót azoknak, akik szeretnének egészségesebben élni, sportolni, vagy akár fogyni, izmosodni. A felhasználók regisztráció után egy kérdőívet töltenek ki, amely alapján a rendszer személyre szabott edzéstervet és étrendet ajánl. A naptár funkcióval nyomon követhetik az edzéseiket, az étrend/receptek részben pedig egészséges ételeket kereshetnek, szűrhetnek allergének szerint is. A rendszer támogatja az elfelejtett jelszó funkciót, statisztikákat mutat, és minden adatot biztonságosan kezel.

### 5 perces verzió

A MuscleMind egy modern, full-stack webalkalmazás, amelyet kétfős csapatban fejlesztettünk. A projekt célja, hogy a felhasználók számára egy komplex, de könnyen használható platformot biztosítson az egészséges életmód támogatására. A rendszer fő funkciói közé tartozik a regisztráció és bejelentkezés, ahol a felhasználók biztonságosan hozhatnak létre fiókot. Az első belépés után egy részletes kérdőívet töltenek ki, amely alapján a rendszer kiszámolja például a BMI-t, BMR-t, és ezek alapján ajánl edzéstervet, étrendet. A naptár funkcióban a felhasználók megtervezhetik és naplózhatják az edzéseiket, míg az étrend/receptek részben egészséges ételeket kereshetnek, akár allergének szerint is szűrve. A rendszer támogatja az elfelejtett jelszó funkciót, statisztikákat mutat, és minden adatot biztonságosan, jelszóhash-eléssel és tokenekkel kezel. A projekt során nagy hangsúlyt fektettünk a felhasználói élményre, a biztonságra és a skálázhatóságra.

---

## 2. A projekt technológiai áttekintése

| Technológia      | Mire szolgál? | MuscleMind-ben mire használjuk? | Hol található? | Vizsgakérdés | Jó válasz |
|------------------|---------------|----------------------------------|----------------|--------------|-----------|
| **HTML**         | Weboldal szerkezete | Oldalak felépítése, űrlapok, naptár, profil | frontend/html/ | Mi a HTML szerepe? | A HTML adja a weboldal szerkezetét, minden oldal alapja. |
| **CSS**          | Stílus, megjelenés | Egyedi design, reszponzivitás, színek | frontend/css/ | Miért fontos a CSS? | A CSS szabja meg az oldal kinézetét, felhasználói élményt javít. |
| **Bootstrap**    | CSS keretrendszer | Gyorsabb, reszponzív design, gombok, grid | frontend/bootstrap/ | Miért használunk Bootstrap-et? | Gyors, egységes, mobilbarát felületet ad. |
| **JavaScript**   | Dinamikus működés | Űrlapvalidáció, API-hívások, naptár, interakciók | frontend/javascript/ | Mire jó a JS? | A JS teszi dinamikussá az oldalt, kezeli az eseményeket. |
| **Node.js**      | Backend futtatókörnyezet | Szerveroldali logika, API-k, adatbázis-kezelés | backend/ | Mi az a Node.js? | Egy JavaScript futtatókörnyezet szerveroldalon. |
| **Express.js**   | Node.js keretrendszer | API-k, route-ok, middleware-ek | backend/app.js, backend/api/ | Mi az az Express? | Egy Node.js keretrendszer, ami megkönnyíti a szerver fejlesztését. |
| **MySQL**        | Relációs adatbázis | Felhasználók, edzések, receptek, kérdőív tárolása | backend/sql/database.sql | Mi az a MySQL? | Egy relációs adatbázis, ahol strukturáltan tároljuk az adatokat. |
| **mysql2/promise** | MySQL driver | Aszinkron adatbázis-műveletek | backend/sql/database.js | Miért jó a promise alapú MySQL? | Aszinkron, nem blokkolja a szervert, könnyebb hibakezelés. |
| **Session kezelés** | Állapotkezelés | Bejelentkezés, jogosultságok, felhasználói adatok | backend/app.js, backend/middleware/ | Mi az a session? | Egy szerveroldali tároló, ami megőrzi a felhasználó állapotát. |
| **Middleware**   | Köztes réteg | Jogosultság, validáció, hibakezelés | backend/middleware/ | Mire jó a middleware? | Köztes logika, pl. csak bejelentkezett felhasználó fér hozzá. |
| **API-végpontok** | Kommunikáció | Frontend és backend közötti adatcsere | backend/api/ | Mi az az API? | Egy interfész, amin keresztül a frontend adatot kér a backendtől. |
| **bcrypt**       | Jelszóhash-elés | Jelszavak biztonságos tárolása | backend/api/auth.routes.js | Miért nem simán tároljuk a jelszót? | A hash-elés megvédi a jelszavakat, ha kiszivárog az adatbázis. |
| **Tokenkezelés** | Jogosultság, reset | Elfelejtett jelszó, emailes azonosítás | backend/api/auth.routes.js | Mire jó a token? | Egyedi azonosító, pl. jelszó-visszaállításhoz. |
| **Chart.js**     | Grafikonok | Statisztikák, fejlődés megjelenítése | frontend/javascript/stats.js | Mire jó a Chart.js? | Látványos grafikonokat rajzol a statisztikákhoz. |

---

## 3. Projektmappa és architektúra magyarázata

### Fő mappák és szerepük

| Mappa/Fájl | Szerepe |
|------------|---------|
| **backend/** | Szerveroldali logika, API-k, adatbázis-kezelés |
| **frontend/** | Felhasználói felület, HTML, CSS, JS |
| **backend/api/** | API-végpontok (route-ok) |
| **backend/middleware/** | Jogosultság, validáció, köztes logika |
| **backend/sql/** | Adatbázis kapcsolódás, SQL scriptek |
| **frontend/html/** | Oldalak szerkezete |
| **frontend/css/** | Oldalak stílusa |
| **frontend/javascript/** | Oldalak működése, API-hívások |
| **frontend/images/** | Képek, ikonok |
| **uploads/** | (ellenőrizendő) Fájl feltöltések helye, ha van |
| **coverage/** | Tesztlefedettség jelentések |
| **tests/** | Tesztfájlok (backend és frontend is) |

### Főbb fájlok

- **backend/app.js**: Express szerver konfiguráció, middleware-ek, route-ok bekötése.
- **backend/server.js**: Szerver indítása, port beállítása.
- **backend/sql/database.js**: MySQL adatbázis kapcsolat, query-k.
- **backend/api/*.routes.js**: Egyes funkciókhoz tartozó API-végpontok (pl. auth, meals, profile).
- **backend/middleware/*.js**: Jogosultság, validáció, pl. isAdmin, login ellenőrzés.
- **frontend/html/*.html**: Felhasználói oldalak (pl. login, registration, profile).
- **frontend/css/*.css**: Oldalakhoz tartozó stílusok.
- **frontend/javascript/*.js**: Oldalak működése, API-hívások, validáció.

### Kérés útja a böngészőtől az adatbázisig

1. **Felhasználó** kitölt egy űrlapot (pl. regisztráció).
2. **Frontend JS** validálja az adatokat, majd AJAX-szal elküldi az API-nak.
3. **Backend API** (Express route) fogadja a kérést, middleware ellenőrzi.
4. **Backend logika** feldolgozza, SQL query-t küld a database.js-en keresztül.
5. **Adatbázis** (MySQL) elvégzi a műveletet (pl. új user beszúrása).
6. **Backend** visszaküldi a választ (siker/hiba).
7. **Frontend JS** feldolgozza a választ, frissíti a felületet.

#### Szóban elmondható összefoglaló

„A MuscleMind projekt felépítése úgy működik, hogy a frontend oldalon a felhasználó kitölti az űrlapokat, például regisztrációkor. Ezeket az adatokat a JavaScript validálja, majd elküldi a backendnek egy API-végponton keresztül. A backend oldalon Express.js fut, ami middleware-eken keresztül ellenőrzi a jogosultságokat, validálja az adatokat, majd az adatbázisba írja vagy onnan olvas. Az eredményt visszaküldi a frontendnek, ami megjeleníti a választ a felhasználónak.”

---

## 4. PowerPoint előadás teljes beszédvázlata

### 1. dia: Cím és csapat

- **Cél:** Bemutatkozás, projekt neve, csapat
- **Szöveg:**  
  „Sziasztok, mi vagyunk a MuscleMind csapata. Ketten dolgoztunk ezen a projekten, amely egy egészséges életmódot támogató webalkalmazás. A következő fél órában bemutatjuk a projekt fő céljait, funkcióit és technológiai hátterét.”
- **Kulcsszavak:** MuscleMind, egészséges életmód, csapatmunka
- **Kérdés:** Miért ketten dolgoztatok?  
  **Válasz:** Mert a projekt komplexitása miatt így tudtuk hatékonyan felosztani a feladatokat.

### 2. dia: Problémafelvetés

- **Cél:** Miért van szükség ilyen alkalmazásra?
- **Szöveg:**  
  „Sokan szeretnének egészségesebben élni, de nehéz eligazodni az edzéstervek, étrendek, receptek között. A MuscleMind célja, hogy mindezt egy helyen, személyre szabottan kínálja.”
- **Kulcsszavak:** egészséges életmód, személyre szabott, problémamegoldás
- **Kérdés:** Miért nem elég egy sima edzésapp?  
  **Válasz:** Mert itt minden egy helyen, személyre szabottan elérhető.

### 3. dia: Fő funkciók áttekintése

- **Cél:** Főbb modulok bemutatása
- **Szöveg:**  
  „A MuscleMind fő funkciói: regisztráció, bejelentkezés, kérdőív, naptár, étrend/receptek, statisztikák, elfelejtett jelszó, admin felület.”
- **Kulcsszavak:** regisztráció, kérdőív, naptár, étrend, statisztika
- **Kérdés:** Melyik a legfontosabb funkció?  
  **Válasz:** A kérdőív, mert ez alapján személyre szabott a rendszer.

### 4. dia: Felhasználói folyamat

- **Cél:** Felhasználó útja a rendszerben
- **Szöveg:**  
  „A felhasználó regisztrál, kitölti a kérdőívet, majd a rendszer ajánl neki edzéstervet és étrendet. Ezeket a naptárban követheti, és statisztikákat is nézhet.”
- **Kulcsszavak:** regisztráció, kérdőív, ajánlás, naptár
- **Kérdés:** Mi történik, ha nem tölti ki a kérdőívet?  
  **Válasz:** Nem kap személyre szabott ajánlást.

### 5. dia: Technológiai háttér

- **Cél:** Milyen technológiákat használtunk?
- **Szöveg:**  
  „A frontend HTML, CSS, Bootstrap és JavaScript alapú. A backend Node.js és Express.js, az adatokat MySQL-ben tároljuk. A jelszavakat bcrypt-tel hash-eljük, a statisztikákhoz Chart.js-t használunk.”
- **Kulcsszavak:** HTML, CSS, JS, Node.js, Express, MySQL, bcrypt, Chart.js
- **Kérdés:** Miért pont ezeket választottátok?  
  **Válasz:** Mert ezek elterjedtek, jól dokumentáltak, és támogatják a projekt céljait.

### 6. dia: Adatbázis felépítése

- **Cél:** Főbb táblák, kapcsolatok
- **Szöveg:**  
  „Az adatbázisban külön táblák vannak a felhasználókra, kérdőívre, edzéstervekre, receptekre, allergénekre. Ezek kapcsolódnak egymáshoz, például a felhasználóhoz tartozik a kérdőív és a naptár is.”
- **Kulcsszavak:** users, questionnaire, workouts, foods, allergens
- **Kérdés:** Miért nem egy táblában van minden?  
  **Válasz:** Mert így átláthatóbb, könnyebb karbantartani, és elkerülhető az adatismétlés.

### 7. dia: Regisztráció folyamata

- **Cél:** Regisztráció lépései, biztonság
- **Szöveg:**  
  „A regisztráció során a felhasználó megadja az adatait, a frontend validálja, majd a backend bcrypt-tel hash-eli a jelszót, és csak így kerül az adatbázisba.”
- **Kulcsszavak:** validáció, hash-elés, biztonság
- **Kérdés:** Miért fontos a hash-elés?  
  **Válasz:** Mert így a jelszavak nem olvashatók ki az adatbázisból.

### 8. dia: Elfelejtett jelszó

- **Cél:** Tokenes jelszó-visszaállítás
- **Szöveg:**  
  „Ha valaki elfelejti a jelszavát, emailben kap egy egyedi tokent, amivel új jelszót állíthat be. A token csak egyszer használható és időkorlátos.”
- **Kulcsszavak:** token, email, biztonság
- **Kérdés:** Miért jobb ez, mint egy sima jelszócsere?  
  **Válasz:** Mert így csak a jogosult fér hozzá, és a token időkorlátos.

### 9. dia: Kérdőív és személyre szabás

- **Cél:** Miért fontos a kérdőív?
- **Szöveg:**  
  „A kérdőívben a felhasználó megadja a célját, testadatait, aktivitását. Ezek alapján számoljuk ki a BMI-t, BMR-t, és ajánlunk edzéstervet, étrendet.”
- **Kulcsszavak:** kérdőív, személyre szabás, BMI, BMR
- **Kérdés:** Mi történik, ha rossz adatot ad meg?  
  **Válasz:** A rendszer validálja az adatokat, de a felhasználó is módosíthatja később.

### 10. dia: Naptár és edzéstervezés

- **Cél:** Naptár funkció bemutatása
- **Szöveg:**  
  „A naptárban a felhasználó látja az edzéseit, bejelölheti, ha elvégezte, és visszanézheti a fejlődését. Az edzések naplózása segíti a motivációt.”
- **Kulcsszavak:** naptár, edzésnapló, motiváció
- **Kérdés:** Lehet-e módosítani az edzéseket?  
  **Válasz:** Igen, a felhasználó szerkesztheti a naptárát.

### 11. dia: Étrend és receptek

- **Cél:** Receptek, szűrés, allergének
- **Szöveg:**  
  „Az étrend/receptek részben egészséges ételeket lehet keresni, szűrni például allergének szerint. Így mindenki találhat magának megfelelő ételt.”
- **Kulcsszavak:** étrend, receptek, allergének, szűrés
- **Kérdés:** Lehet saját receptet hozzáadni?  
  **Válasz:** (ellenőrizendő) Jelenleg csak adminisztrátor adhat hozzá új receptet.

### 12. dia: Statisztikák és motiváció

- **Cél:** Fejlődés követése, grafikonok
- **Szöveg:**  
  „A statisztikák oldalon a felhasználó grafikonokon láthatja a fejlődését, például testsúly, edzésszám, elégetett kalória.”
- **Kulcsszavak:** statisztika, grafikon, motiváció
- **Kérdés:** Milyen könyvtárat használtatok?  
  **Válasz:** Chart.js-t, mert egyszerű és látványos.

### 13. dia: Biztonság és adatvédelem

- **Cél:** Felhasználói adatok védelme
- **Szöveg:**  
  „A jelszavakat hash-eljük, a session-öket biztonságosan kezeljük, az API-k middleware-eken keresztül védettek. Az adatokat nem adjuk ki harmadik félnek.”
- **Kulcsszavak:** hash, session, middleware, adatvédelem
- **Kérdés:** Mi történik, ha valaki feltöri az adatbázist?  
  **Válasz:** A jelszavak hash-elve vannak, így nem olvashatók ki.

### 14. dia: Fejlesztési lehetőségek

- **Cél:** Hogyan lehetne továbbfejleszteni?
- **Szöveg:**  
  „A jövőben lehetne mobilappot fejleszteni, képfeltöltést, közösségi funkciókat, vagy akár AI-alapú ajánlásokat is beépíteni.”
- **Kulcsszavak:** fejlesztés, mobilapp, AI, közösség
- **Kérdés:** Miért nincs most képfeltöltés?  
  **Válasz:** Mert a fő fókusz a funkciókon volt, de a jövőben bővíthető.

### 15. dia: Összegzés, kérdések

- **Cél:** Lezárás, kérdések
- **Szöveg:**  
  „Köszönjük a figyelmet! Szívesen válaszolunk bármilyen kérdésre a projekttel kapcsolatban.”
- **Kulcsszavak:** összegzés, kérdések, csapatmunka
- **Kérdés:** Mi volt a legnagyobb kihívás?  
  **Válasz:** Az adatbázis tervezése és a személyre szabott ajánlások logikája.

---

## 5. Kódbemutatás menetrendje 30 percre

### 1. Regisztráció

- **Frontend oldal:** registration.html
- **Frontend logika:** register.js (frontend/javascript/register.js)
- **API hívás:** POST /api/auth/register (backend/api/auth.routes.js)
- **Backend feldolgozás:** auth.routes.js, registrationMiddleware.js
- **Adatbázis művelet:** database.js, createUser függvény (ellenőrizendő)
- **Érintett táblák:** users
- **Validáció:** frontend JS + backend middleware (pl. email, jelszó erősség)
- **Hibakezelés:** hibakódok, üzenetek frontendre
- **Biztonság:** bcrypt hash, session indítás
- **Élőben mutatni:** űrlap kitöltése, hibás/sikeres regisztráció
- **Szóbeli magyarázat:** „A regisztráció során először a frontend ellenőrzi a mezőket, majd elküldi az adatokat az API-nak, ahol a backend újra validál, hash-eli a jelszót, és elmenti az adatbázisba.”

### 2. Elfelejtett jelszó

- **Frontend oldal:** forgot-password.html, reset-password.html
- **Frontend logika:** forgot-pass.js, reset-pass.js
- **API hívás:** POST /api/auth/forgot-password, POST /api/auth/reset-password
- **Backend feldolgozás:** auth.routes.js, token generálás, email küldés (ellenőrizendő)
- **Adatbázis művelet:** password_reset_tokens tábla (ellenőrizendő)
- **Érintett táblák:** users, password_reset_tokens
- **Validáció:** email létezése, token ellenőrzés, jelszó erősség
- **Hibakezelés:** token lejárat, hibás email
- **Biztonság:** token csak egyszer használható, időkorlátos
- **Élőben mutatni:** elfelejtett jelszó folyamat, tokenes link
- **Szóbeli magyarázat:** „A felhasználó emailt kap egy tokennel, amivel új jelszót állíthat be. A token csak egyszer használható és időkorlátos.”

### 3. Felhasználói kérdőív

- **Frontend oldal:** questionnaire.html
- **Frontend logika:** question.js
- **API hívás:** POST /api/questionnaire
- **Backend feldolgozás:** questionnaire.routes.js, kerdoiv.middleware.js
- **Adatbázis művelet:** questionnaire tábla (ellenőrizendő)
- **Érintett táblák:** questionnaire, users
- **Validáció:** kötelező mezők, számértékek, életkor, testsúly stb.
- **Hibakezelés:** hibás adatok, hiányzó mezők
- **Biztonság:** csak bejelentkezett felhasználó töltheti ki
- **Élőben mutatni:** kérdőív kitöltése, ajánlás generálása
- **Szóbeli magyarázat:** „A kérdőív alapján számoljuk ki a BMI-t, BMR-t, és ajánlunk edzéstervet, étrendet.”

### 4. Naptár

- **Frontend oldal:** calendar.html
- **Frontend logika:** calendar.js
- **API hívás:** GET/POST /api/calendar, /api/workout
- **Backend feldolgozás:** calendar vagy workout.routes.js
- **Adatbázis művelet:** calendar/logs tábla (ellenőrizendő)
- **Érintett táblák:** calendar, workouts, users
- **Validáció:** dátum, jogosultság
- **Hibakezelés:** ütközések, hibás dátum
- **Biztonság:** csak saját naptár módosítható
- **Élőben mutatni:** edzés hozzáadása, naplózás
- **Szóbeli magyarázat:** „A naptárban a felhasználó látja az edzéseit, naplózhatja, szerkesztheti azokat.”

### 5. Étrend / receptek

- **Frontend oldal:** meals.html
- **Frontend logika:** meals.js
- **API hívás:** GET /api/meals, /api/foods
- **Backend feldolgozás:** meals.routes.js, foods.middleware.js
- **Adatbázis művelet:** foods, recipes, allergens táblák
- **Érintett táblák:** foods, recipes, allergens, users
- **Validáció:** szűrési feltételek, allergének
- **Hibakezelés:** nincs találat, hibás szűrés
- **Biztonság:** csak olvasás, admin adhat hozzá új receptet
- **Élőben mutatni:** recept szűrés, allergén szűrő
- **Szóbeli magyarázat:** „Az étrend/receptek oldalon egészséges ételeket lehet keresni, szűrni allergének szerint is.”

---

## 6. Regisztráció részletes tanulási anyag

### Folyamat

1. **Felhasználó megadja:** név, email, jelszó, jelszó megerősítés
2. **Frontend validáció:** kötelező mezők, email formátum, jelszó erősség (regex)
3. **Adatok elküldése:** JS fetch/axios POST /api/auth/register
4. **Backend validáció:** registrationMiddleware.js (pl. email egyediség, jelszó hossza)
5. **Jelszó hash-elése:** bcrypt.hash()
6. **Adatbázisba írás:** users tábla (database.js)
7. **Session indítás:** sikeres regisztráció után
8. **Hibakezelés:** hibakódok, üzenetek frontendre

### Vizsgán elmondható szöveg

„A regisztráció során a felhasználó megadja az adatait, a frontend ellenőrzi a mezőket, majd elküldi az API-nak. A backend újra validál, a jelszót bcrypt-tel hash-eli, és csak így kerül az adatbázisba. Ha minden rendben, elindul a session, és a felhasználó belép.”

### Kódbemutatós magyarázat

- **registration.html**: űrlap mezői
- **register.js**: validáció, fetch POST /api/auth/register
- **auth.routes.js**: route fogadja a kérést, meghívja a registrationMiddleware-t
- **registrationMiddleware.js**: ellenőrzi az adatokat
- **bcrypt.hash()**: jelszó hash-elése
- **database.js**: beszúrja az új user-t
- **users tábla**: email, hash-elt jelszó, név

### Lehetséges kérdések

- Miért kell hash-elni a jelszót?
  - **Válasz:** Hogy ne legyen olvasható az adatbázisban, így biztonságosabb.
- Hol történik a validáció?
  - **Válasz:** Először a frontend JS-ben, majd a backend middleware-ben is.
- Mi történik, ha már létezik az email?
  - **Válasz:** Hibát ad vissza a backend, a frontend megjeleníti.

---

## 7. Elfelejtett jelszó részletes tanulási anyag

### Folyamat

1. **Felhasználó elindítja:** forgot-password.html, beírja az emailt
2. **Frontend elküldi:** POST /api/auth/forgot-password
3. **Backend ellenőrzi:** van-e ilyen email
4. **Token generálás:** egyedi, időkorlátos token (pl. crypto.randomBytes)
5. **Token mentése:** password_reset_tokens tábla (user_id, token, lejárat)
6. **Email küldés:** tokenes link a felhasználónak (ellenőrizendő, hogy van-e emailküldés)
7. **Felhasználó rákattint:** reset-password.html, token a linkben
8. **Frontend elküldi:** új jelszó + token POST /api/auth/reset-password
9. **Backend ellenőrzi:** token érvényes-e, nem járt-e le
10. **Jelszó hash-elése:** bcrypt
11. **Adatbázis frissítése:** users tábla új hash
12. **Token törlése:** egyszer használható

### Vizsgán elmondható magyarázat

„Az elfelejtett jelszó funkcióban a felhasználó emailt kap egy egyedi tokennel, amivel új jelszót állíthat be. A token csak egyszer használható és időkorlátos, így biztonságos.”

### Kódbemutatási sorrend

- forgot-password.html, forgot-pass.js
- auth.routes.js: POST /forgot-password
- token generálás, mentés
- reset-password.html, reset-pass.js
- auth.routes.js: POST /reset-password
- token ellenőrzés, jelszó hash, adatbázis frissítés

### Lehetséges kérdések

- Miért jobb a tokenes megoldás?
  - **Válasz:** Mert csak a jogosult fér hozzá, és a token időkorlátos.
- Hol tárolódik a token?
  - **Válasz:** Az adatbázisban, a password_reset_tokens táblában.
- Mi történik, ha lejárt a token?
  - **Válasz:** Hibát ad vissza, új folyamatot kell indítani.

---

## 8. Felhasználói kérdőív részletes tanulási anyag

### Miért van szükség kérdőívre?

- Személyre szabott ajánlásokhoz (edzésterv, étrend)
- Felhasználó céljainak, testadatainak rögzítése

### Milyen adatokat kér be?

- Nem, életkor, testsúly, magasság, cél (pl. fogyás, izmosodás), aktivitás, esetleg egészségügyi adatok

### Hogyan kapcsolódik a profilhoz?

- A questionnaire tábla user_id-vel kapcsolódik a users táblához

### Adatok mentése

- Frontend: question.js, POST /api/questionnaire
- Backend: questionnaire.routes.js, kerdoiv.middleware.js
- Adatbázis: questionnaire tábla

### Számítások

- BMI = testsúly / (magasság/100)^2
- BMR = alapanyagcsere (képlet nemenként eltérő)
- Napi kalória = BMR * aktivitási szorzó
- Ezek alapján ajánlás generálás

### Validációk

- Kötelező mezők, számértékek, életkor, testsúly, magasság

### Fájlok

- frontend/html/questionnaire.html
- frontend/javascript/question.js
- backend/api/questionnaire.routes.js
- backend/middleware/kerdoiv.middleware.js
- backend/sql/database.js

### Rövid magyarázat

„A kérdőív alapján személyre szabott ajánlást adunk, például edzéstervet és étrendet.”

### Kódbemutatási terv

- questionnaire.html: űrlap
- question.js: validáció, API-hívás
- questionnaire.routes.js: adatfeldolgozás
- kerdoiv.middleware.js: validáció, számítások
- database.js: mentés

### Kérdés-válasz

- Miért fontos a kérdőív?
  - **Válasz:** Mert így tudunk személyre szabott ajánlást adni.
- Hol történik a BMI számítás?
  - **Válasz:** A backend middleware-ben, a kerdoiv.middleware.js-ben.

---

## 9. Naptár részletes tanulási anyag

### Folyamat

- Edzésterv a kérdőív alapján generálódik, vagy a felhasználó választ
- Naptári napok: calendar.html, calendar.js generálja a felületet
- Adatbázis: calendar vagy logs tábla tárolja az edzéseket
- Edzések naplózása: felhasználó bejelöli, ha elvégezte
- Edzés lezárása: státusz módosítása az adatbázisban
- Statisztikák: logs alapján számolható
- Dátumkezelés: JS Date objektum, backend oldalon is ellenőrzés
- Hibák: hibás dátum, ütközés, jogosultság
- Fájlok: calendar.html, calendar.js, backend/api/calendar.routes.js vagy workout.routes.js

### Vizsgán elmondható magyarázat

„A naptárban a felhasználó látja az edzéseit, naplózhatja, szerkesztheti azokat. Az edzések naplózása segíti a motivációt és a statisztikák számítását.”

### Kódbemutatási sorrend

- calendar.html, calendar.js
- API-hívás: GET/POST /api/calendar
- backend/api/calendar.routes.js
- database.js: naptár/logs tábla

### Kérdés-válasz

- Hogyan kerül be az edzés a naptárba?
  - **Válasz:** A kérdőív vagy a felhasználó választása alapján, az adatbázisban tároljuk.
- Mi történik, ha hibás dátumot ad meg?
  - **Válasz:** A backend validálja, hibát ad vissza.

---

## 10. Étrend / receptek részletes tanulási anyag

### Folyamat

- Receptek megjelenítése: meals.html, meals.js
- Szűrés: allergének, kalória, típus szerint
- Adatbázis: foods, recipes, allergens táblák
- Saját receptek: (ellenőrizendő) csak admin adhat hozzá
- Adatok lekérése: GET /api/meals, /api/foods
- Allergének kezelése: foods.middleware.js
- Fájlok: meals.html, meals.js, backend/api/meals.routes.js, foods.middleware.js

### Rövid magyarázat

„Az étrend/receptek oldalon egészséges ételeket lehet keresni, szűrni allergének szerint is.”

### Részletes kódbemutatós magyarázat

- meals.html: kereső, szűrő
- meals.js: API-hívás, szűrés
- meals.routes.js: lekérdezés, szűrés backend oldalon
- foods.middleware.js: allergének kezelése
- database.js: foods, recipes, allergens táblák

### Kérdés-válasz

- Hogyan lehet szűrni allergének szerint?
  - **Válasz:** A frontend elküldi a szűrési feltételeket, a backend csak azokat a recepteket adja vissza, amik nem tartalmazzák az adott allergént.
- Lehet saját receptet hozzáadni?
  - **Válasz:** (ellenőrizendő) Jelenleg csak adminisztrátor adhat hozzá új receptet.

---

## 11. Adatbázis részletes magyarázata

### Táblák

| Tábla neve | Mire szolgál? | Fontos mezők | Kapcsolatok | Funkciók |
|------------|---------------|--------------|-------------|----------|
| **users** | Felhasználók | id, email, password_hash, név | questionnaire, calendar, logs | regisztráció, login |
| **questionnaire** | Kérdőív adatok | id, user_id, nem, életkor, testsúly, magasság, cél | users (user_id) | kérdőív kitöltés |
| **workouts** | Edzéstervek | id, user_id, dátum, típus, státusz | users | naptár, edzésnapló |
| **calendar/logs** | Naptári napló | id, user_id, workout_id, dátum, státusz | users, workouts | edzésnapló |
| **foods** | Ételek | id, név, kalória, allergének | allergens | étrend |
| **recipes** | Receptek | id, név, leírás, hozzávalók | foods | étrend |
| **allergens** | Allergének | id, név | foods | szűrés |
| **password_reset_tokens** | Jelszó reset tokenek | id, user_id, token, lejárat | users | elfelejtett jelszó |
| **logs** | Rendszer napló | id, user_id, esemény, dátum | users | admin, statisztika |

### Fogalmak

- **Elsődleges kulcs:** Egyedi azonosító (pl. id)
- **Idegen kulcs:** Másik tábla id-jára hivatkozik (pl. user_id)
- **Adatbázis-kapcsolat:** Táblák összekapcsolása, adatismétlés elkerülése
- **Több tábla előnye:** Átláthatóbb, könnyebb karbantartani, elkerülhető az adatismétlés

---

## 12. Fontos szakszavak és alapfogalmak vizsgára

| Fogalom | Magyarázat | MuscleMind példa | Vizsgakérdés | Jó válasz |
|---------|------------|------------------|--------------|-----------|
| **frontend** | Felhasználói felület | HTML, CSS, JS | Mi a frontend? | Az, amit a felhasználó lát és használ. |
| **backend** | Szerveroldali logika | Node.js, Express | Mi a backend? | Az, ami a szerveren fut, kezeli az adatokat. |
| **full-stack** | Mindkét oldal | MuscleMind teljes rendszere | Mit jelent a full-stack? | Frontend és backend együtt. |
| **API** | Adatkapcsolat | /api/auth/register | Mi az API? | Egy interfész, amin keresztül a frontend adatot kér a backendtől. |
| **endpoint** | API végpont | /api/meals | Mi az endpoint? | Egy konkrét API-cím, amit meghívunk. |
| **HTTP metódus** | Művelet típusa | GET, POST | Mi az a HTTP metódus? | Meghatározza, mit akarunk csinálni (pl. lekér, küld). |
| **GET** | Lekérdezés | GET /api/meals | Mire jó a GET? | Adat lekérése a szervertől. |
| **POST** | Új adat küldése | POST /api/auth/register | Mire jó a POST? | Új adatot küldünk a szervernek. |
| **PUT** | Teljes módosítás | PUT /api/profile | Mire jó a PUT? | Egy adat teljes cseréje. |
| **PATCH** | Részleges módosítás | PATCH /api/profile | Mire jó a PATCH? | Egy adat részleges módosítása. |
| **DELETE** | Törlés | DELETE /api/meal/1 | Mire jó a DELETE? | Adat törlése a szerveren. |
| **request** | Kérés | JS fetch | Mi az a request? | A frontend kérése a szerver felé. |
| **response** | Válasz | API válasz | Mi az a response? | A szerver válasza a frontendnek. |
| **JSON** | Adatformátum | API válasz | Mi az a JSON? | Egy könnyen olvasható adatcsere formátum. |
| **session** | Állapot | Bejelentkezés | Mi az a session? | A szerver megjegyzi, ki van bejelentkezve. |
| **middleware** | Köztes réteg | login.middleware.js | Mire jó a middleware? | Köztes logika, pl. jogosultság ellenőrzés. |
| **authentication** | Hitelesítés | login | Mi az authentication? | A felhasználó azonosítása. |
| **authorization** | Jogosultság | isAdmin.middleware.js | Mi az authorization? | Jogosultság ellenőrzése. |
| **hash** | Egyirányú kódolás | bcrypt | Mi az a hash? | Egyirányú kódolás, pl. jelszavakhoz. |
| **token** | Egyedi azonosító | jelszó reset | Mire jó a token? | Egyedi azonosítás, pl. jelszó-visszaállításhoz. |
| **validáció** | Ellenőrzés | registrationMiddleware.js | Mi az a validáció? | Adatok ellenőrzése, hogy helyesek-e. |
| **regex** | Mintakeresés | email ellenőrzés | Mire jó a regex? | Minták alapján ellenőriz adatokat. |
| **adatbázis** | Adattárolás | MySQL | Mi az adatbázis? | Struktúráltan tárolja az adatokat. |
| **SQL** | Lekérdezőnyelv | database.sql | Mi az az SQL? | Adatbázis lekérdező nyelv. |
| **primary key** | Egyedi azonosító | users.id | Mi az a primary key? | Egyedi azonosító minden sorhoz. |
| **foreign key** | Kapcsolat | questionnaire.user_id | Mi az a foreign key? | Másik tábla id-jára hivatkozik. |
| **async / await** | Aszinkron művelet | database.js | Mire jó az async/await? | Aszinkron kódot írhatunk vele egyszerűen. |
| **promise** | Aszinkron eredmény | mysql2/promise | Mi az a promise? | Egy jövőbeli értéket képvisel. |
| **try-catch** | Hibakezelés | minden API-ban | Mire jó a try-catch? | Hibák kezelésére szolgál. |
| **CRUD** | Alapműveletek | users tábla | Mi az a CRUD? | Create, Read, Update, Delete műveletek. |
| **MVC** | Architektúra | (részben) | Mi az az MVC? | Model-View-Controller, réteges felépítés. |

---

## 13. Lehetséges vizsgabizottsági kérdések és válaszok

### Általános projektkérdések

1. Mi a MuscleMind célja?  
   **Válasz:** Egészséges életmód támogatása személyre szabott edzéstervekkel és étrenddel.
2. Kik használhatják?  
   **Válasz:** Bárki, aki szeretne tudatosabban sportolni és étkezni.
3. Miért ezt a témát választottátok?  
   **Válasz:** Mert fontosnak tartjuk az egészséges életmódot, és szerettünk volna egy hasznos alkalmazást készíteni.
4. Hányan dolgoztatok rajta?  
   **Válasz:** Ketten, csapatmunkában.
5. Mennyi idő alatt készült el?  
   **Válasz:** Több hét alatt, folyamatos fejlesztéssel.

### Technológiai kérdések

6. Miért Node.js-t választottatok?  
   **Válasz:** Mert gyors, aszinkron, és jól támogatja az API-fejlesztést.
7. Mi az az Express.js?  
   **Válasz:** Egy Node.js keretrendszer, ami megkönnyíti a szerveroldali fejlesztést.
8. Miért MySQL-t használtatok?  
   **Válasz:** Mert relációs adatbázis, jól strukturálható, és elterjedt.
9. Mire jó a bcrypt?  
   **Válasz:** Jelszavak biztonságos hash-elésére.
10. Mi az a middleware?  
    **Válasz:** Egy köztes réteg, ami például jogosultságot vagy validációt kezel.

### Frontend kérdések

11. Milyen technológiákat használtatok a frontendhez?  
    **Válasz:** HTML, CSS, Bootstrap, JavaScript.
12. Miért jó a Bootstrap?  
    **Válasz:** Mert gyors, reszponzív, egységes kinézetet ad.
13. Hogyan kommunikál a frontend a backendel?  
    **Válasz:** API-hívásokkal, fetch vagy axios segítségével.
14. Hol történik a validáció?  
    **Válasz:** Először a frontend JS-ben, majd a backend middleware-ben is.
15. Milyen hibakezelést használtatok a frontend oldalon?  
    **Válasz:** Hibakódokat és üzeneteket jelenítünk meg a felhasználónak.

### Backend kérdések

16. Hogyan indítjátok el a szervert?  
    **Válasz:** A backend/server.js fájlból, Node.js-sel.
17. Hol történik az adatbázis-kapcsolat?  
    **Válasz:** A backend/sql/database.js fájlban.
18. Hogyan kezelitek a session-öket?  
    **Válasz:** Express-session vagy hasonló csomaggal, szerveroldalon.
19. Mire jó az isAdmin.middleware.js?  
    **Válasz:** Csak adminisztrátorok férhetnek hozzá bizonyos API-khoz.
20. Hogyan kezelitek a hibákat a backendben?  
    **Válasz:** try-catch blokkokkal, hibakódokkal válaszolunk.

### Adatbázis kérdések

21. Mi az elsődleges kulcs?  
    **Válasz:** Egyedi azonosító minden sorhoz, pl. id.
22. Mi az idegen kulcs?  
    **Válasz:** Másik tábla id-jára hivatkozik, pl. user_id.
23. Miért nem egy táblában van minden adat?  
    **Válasz:** Mert így átláthatóbb, elkerülhető az adatismétlés.
24. Hogyan kapcsolódik a users és a questionnaire tábla?  
    **Válasz:** A questionnaire user_id mezője a users id-jára hivatkozik.
25. Milyen adatokat tároltok a logs táblában?  
    **Válasz:** Felhasználói eseményeket, pl. bejelentkezés, edzésnapló.

### Biztonsági kérdések

26. Miért hash-elitek a jelszavakat?  
    **Válasz:** Hogy ne legyenek olvashatók az adatbázisban.
27. Miért jó a tokenes jelszó-visszaállítás?  
    **Válasz:** Mert csak a jogosult fér hozzá, és a token időkorlátos.
28. Hogyan véditek az API-kat?  
    **Válasz:** Middleware-ekkel, jogosultság-ellenőrzéssel.
29. Mi történik, ha valaki feltöri az adatbázist?  
    **Válasz:** A jelszavak hash-elve vannak, így nem olvashatók ki.
30. Hogyan lehetne még biztonságosabb a rendszer?  
    **Válasz:** Kétszintű hitelesítéssel, HTTPS-sel, rate limitinggel.

### Regisztráció

31. Milyen adatokat kértek be regisztrációkor?  
    **Válasz:** Név, email, jelszó, jelszó megerősítés.
32. Hol történik a jelszó hash-elése?  
    **Válasz:** A backendben, a regisztrációs API-ban.
33. Mi történik, ha már létezik az email?  
    **Válasz:** Hibát ad vissza a backend.
34. Miért kell kétszer megadni a jelszót?  
    **Válasz:** Hogy elkerüljük az elgépelést.
35. Hogyan ellenőrzitek az email formátumát?  
    **Válasz:** Regex-szel a frontendben és a backendben is.

### Elfelejtett jelszó

36. Hogyan indul a folyamat?  
    **Válasz:** A felhasználó beírja az emailjét az elfelejtett jelszó oldalon.
37. Hogyan jön létre a token?  
    **Válasz:** A backend generál egy egyedi, időkorlátos tokent.
38. Hol tárolódik a token?  
    **Válasz:** Az adatbázisban, a password_reset_tokens táblában.
39. Mi történik, ha lejárt a token?  
    **Válasz:** Hibát ad vissza, új folyamatot kell indítani.
40. Miért csak egyszer használható a token?  
    **Válasz:** Hogy ne lehessen visszaélni vele.

### Kérdőív

41. Miért van szükség kérdőívre?  
    **Válasz:** Személyre szabott ajánlásokhoz.
42. Milyen adatokat kér be?  
    **Válasz:** Nem, életkor, testsúly, magasság, cél, aktivitás.
43. Hol történik a BMI számítás?  
    **Válasz:** A backend middleware-ben.
44. Hogyan kapcsolódik a kérdőív a profilhoz?  
    **Válasz:** A questionnaire tábla user_id-vel kapcsolódik a users táblához.
45. Mi történik, ha hibás adatot ad meg a felhasználó?  
    **Válasz:** A rendszer validálja, hibát ad vissza.

### Naptár

46. Hogyan kerül be az edzés a naptárba?  
    **Válasz:** A kérdőív vagy a felhasználó választása alapján.
47. Hogyan lehet edzést lezárni?  
    **Válasz:** A felhasználó bejelöli, a státusz módosul az adatbázisban.
48. Milyen adatokat tárol a naptár/logs tábla?  
    **Válasz:** Edzés dátuma, típusa, státusza.
49. Hogyan kezelitek a dátumokat?  
    **Válasz:** JS Date objektummal, backend oldalon is ellenőrizzük.
50. Mi történik, ha hibás dátumot ad meg?  
    **Válasz:** Hibát ad vissza a backend.

### Étrend

51. Hogyan jelennek meg a receptek?  
    **Válasz:** A frontend lekéri az adatokat az API-ból, és megjeleníti.
52. Milyen szűrési lehetőségek vannak?  
    **Válasz:** Allergének, kalória, típus szerint.
53. Hogyan kapcsolódnak az allergének?  
    **Válasz:** A foods tábla allergén mezője az allergens táblára hivatkozik.
54. Lehet saját receptet hozzáadni?  
    **Válasz:** (ellenőrizendő) Jelenleg csak adminisztrátor adhat hozzá.
55. Miért fontos az allergén szűrés?  
    **Válasz:** Hogy mindenki biztonságosan választhasson ételt.

### Tesztelés

56. Milyen teszteket írtatok?  
    **Válasz:** Backend middleware, API, regisztráció, ticket kezelés.
57. Hol találhatók a tesztek?  
    **Válasz:** backend/tests/ és frontend/tests/ mappában.
58. Mire jó a tesztelés?  
    **Válasz:** Hogy megbizonyosodjunk a funkciók helyes működéséről.
59. Milyen tesztelési keretrendszert használtatok?  
    **Válasz:** Jest-et.
60. Mi az a coverage mappa?  
    **Válasz:** A tesztlefedettség jelentéseit tartalmazza.

### Hibakezelés

61. Hogyan kezelitek a hibákat a frontendben?  
    **Válasz:** Hibakódokat és üzeneteket jelenítünk meg.
62. Hogyan kezelitek a hibákat a backendben?  
    **Válasz:** try-catch blokkokkal, hibakódokkal válaszolunk.
63. Mi történik, ha az adatbázis nem elérhető?  
    **Válasz:** Hibát ad vissza a backend, a frontend tájékoztatja a felhasználót.
64. Hogyan lehet hibát naplózni?  
    **Válasz:** A logs táblába írjuk az eseményeket.
65. Miért fontos a hibakezelés?  
    **Válasz:** Hogy a felhasználó tudja, mi a probléma, és ne omoljon össze a rendszer.

### Fejlesztési lehetőségek

66. Hogyan lehetne továbbfejleszteni a projektet?  
    **Válasz:** Mobilapp, képfeltöltés, közösségi funkciók, AI-alapú ajánlás.
67. Miért nincs most képfeltöltés?  
    **Válasz:** Mert a fő fókusz a funkciókon volt, de a jövőben bővíthető.
68. Hogyan lehetne biztonságosabb a rendszer?  
    **Válasz:** Kétszintű hitelesítéssel, HTTPS-sel, rate limitinggel.
69. Miért session alapú a bejelentkezés?  
    **Válasz:** Mert egyszerűbb, és jól működik a jelenlegi felépítéshez.
70. Miért ezeket a technológiákat választottátok?  
    **Válasz:** Mert elterjedtek, jól dokumentáltak, és támogatják a projekt céljait.

### Csapatmunka

71. Hogyan osztottátok fel a munkát?  
    **Válasz:** Egyikünk főleg a backenddel, másikunk a frontendel foglalkozott, de közösen terveztük az architektúrát.
72. Hogyan kommunikáltatok?  
    **Válasz:** Online, rendszeres megbeszélésekkel.
73. Mi volt a legnagyobb kihívás?  
    **Válasz:** Az adatbázis tervezése és a személyre szabott ajánlások logikája.
74. Hogyan oldottátok meg a konfliktusokat?  
    **Válasz:** Megbeszéltük, közösen döntöttünk.
75. Mit tanultatok a csapatmunkából?  
    **Válasz:** Fontos a kommunikáció és a feladatok pontos felosztása.

### Egyéb

76. Mi az a CRUD?  
    **Válasz:** Create, Read, Update, Delete műveletek.
77. Mi az az MVC?  
    **Válasz:** Model-View-Controller, réteges felépítés.
78. Mi az a promise?  
    **Válasz:** Egy jövőbeli értéket képvisel, aszinkron műveletekhez.
79. Mi az az async/await?  
    **Válasz:** Aszinkron kódot írhatunk vele egyszerűen.
80. Mi az a try-catch?  
    **Válasz:** Hibakezelő szerkezet a kódban.

---

## 14. Gyenge pontok és hogyan válaszoljunk rájuk

| Gyenge pont | Mit mondjunk rá? |
|-------------|------------------|
| Nincs képfeltöltés | „A fő fókusz a funkciókon volt, de a jövőben bővíthető.” |
| Validáció főleg frontend | „A backendben is van validáció, de a felhasználói élmény miatt a frontendben is ellenőrzünk.” |
| Session alapú bejelentkezés | „Egyszerűbb, jól működik, de később JWT-re is át lehet térni.” |
| Nincs mobilapp | „Első körben webes alkalmazást készítettünk, de a jövőben mobilapp is készülhet.” |
| Nincs közösségi funkció | „A projekt fókusza a személyre szabott ajánlás, de a közösségi rész bővíthető.” |
| Nincs kétszintű hitelesítés | „A jelenlegi rendszerben ez nem volt követelmény, de biztonsági fejlesztésként beépíthető.” |
| Hibakezelés egyszerű | „A főbb hibákat kezeljük, de a rendszer bővíthető részletesebb naplózással.” |
| Nincs emailküldés tesztelése | „A fejlesztés során főleg a funkciókra koncentráltunk, de a jövőben automatizált email-tesztelés is megvalósítható.” |

---

## 15. Kódrészletek, amiket mindenképp érdemes megmutatni

| Téma | Fájlnév | Függvény/API | Sorhely (kb.) | Miért fontos? | Mit mondjunk? | Kérdés |
|------|---------|--------------|---------------|---------------|--------------|--------|
| Szerver indítás | backend/server.js | - | eleje | Szerver indulása | „Itt indul a szerver, beállítjuk a portot.” | Hogyan indítjátok el? |
| Adatbázis-kapcsolat | backend/sql/database.js | getConnection | eleje | MySQL kapcsolat | „Itt csatlakozunk az adatbázishoz.” | Hogyan kapcsolódtok a DB-hez? |
| Regisztráció | backend/api/auth.routes.js | POST /register | közepén | Új user létrehozása | „Itt történik a regisztráció backend oldalon.” | Hol hash-elitek a jelszót? |
| Login/session | backend/api/auth.routes.js | POST /login | közepén | Bejelentkezés, session | „Itt indítjuk a session-t sikeres login után.” | Hogyan kezelitek a session-t? |
| Elfelejtett jelszó token | backend/api/auth.routes.js | POST /forgot-password | vége | Token generálás | „Itt generáljuk a jelszó reset tokent.” | Hol tárolódik a token? |
| Kérdőív mentés | backend/api/questionnaire.routes.js | POST /questionnaire | közepén | Kérdőív adatok mentése | „Itt mentjük el a kérdőív adatait.” | Hol számoljátok a BMI-t? |
| Számítások | backend/middleware/kerdoiv.middleware.js | - | közepén | BMI, BMR számítás | „Itt számoljuk ki a BMI-t, BMR-t.” | Mi alapján ajánlotok étrendet? |
| Naptárgenerálás | frontend/javascript/calendar.js | - | eleje | Naptár felépítése | „Itt generáljuk a naptár napjait.” | Hogyan kezelitek a dátumokat? |
| Edzés lezárása | backend/api/workout.routes.js | PATCH /workout/:id | vége | Edzés státusz módosítása | „Itt zárható le egy edzés.” | Hogyan naplózzátok az edzést? |
| Étrend/receptek lekérése | backend/api/meals.routes.js | GET /meals | eleje | Receptek lekérése | „Itt kérjük le a recepteket az adatbázisból.” | Hogyan szűrtök allergének szerint? |
| Allergének kezelése | backend/middleware/foods.middleware.js | - | közepén | Allergén szűrés | „Itt szűrjük ki az allergéneket.” | Miért fontos az allergén szűrés? |
| Hibakezelés | backend/api/api.js | - | végén | Hibák kezelése | „Itt kezeljük a hibákat, és visszaadjuk a választ.” | Hogyan kezelitek a hibákat? |
| Middleware-ek | backend/middleware/login.middleware.js | - | eleje | Jogosultság ellenőrzés | „Itt ellenőrizzük, hogy be van-e jelentkezve a felhasználó.” | Mire jó a middleware? |

---

## 16. 1 órás védési forgatókönyv

| Idő | Tevékenység | Ki mondja | Mit mutatunk? | Megjegyzés |
|-----|-------------|-----------|---------------|------------|
| 0-2 perc | Bemutatkozás, projektcím | 1. előadó | PPT dia 1 | Lassan, magabiztosan |
| 2-5 perc | Problémafelvetés, cél | 2. előadó | PPT dia 2 | |
| 5-8 perc | Fő funkciók | 1. előadó | PPT dia 3 | |
| 8-12 perc | Felhasználói folyamat | 2. előadó | PPT dia 4 | |
| 12-15 perc | Technológiai háttér | 1. előadó | PPT dia 5 | |
| 15-18 perc | Adatbázis felépítése | 2. előadó | PPT dia 6 | |
| 18-20 perc | Regisztráció | 1. előadó | PPT dia 7 | |
| 20-22 perc | Elfelejtett jelszó | 2. előadó | PPT dia 8 | |
| 22-24 perc | Kérdőív | 1. előadó | PPT dia 9 | |
| 24-26 perc | Naptár | 2. előadó | PPT dia 10 | |
| 26-28 perc | Étrend/receptek | 1. előadó | PPT dia 11 | |
| 28-29 perc | Statisztikák | 2. előadó | PPT dia 12 | |
| 29-30 perc | Összegzés, kérdések | 1. előadó | PPT dia 15 | |
| 30-32 perc | Regisztráció kód | 1. előadó | registration.html, register.js, auth.routes.js | Böngésző + kód |
| 32-36 perc | Elfelejtett jelszó kód | 2. előadó | forgot-password.html, forgot-pass.js, auth.routes.js | |
| 36-40 perc | Kérdőív kód | 1. előadó | questionnaire.html, question.js, questionnaire.routes.js | |
| 40-44 perc | Naptár kód | 2. előadó | calendar.html, calendar.js, calendar.routes.js | |
| 44-48 perc | Étrend/receptek kód | 1. előadó | meals.html, meals.js, meals.routes.js | |
| 48-52 perc | Adatbázis bemutatása | 2. előadó | database.sql | |
| 52-56 perc | Middleware, hibakezelés | 1. előadó | login.middleware.js, foods.middleware.js | |
| 56-60 perc | Kérdések-válaszok | mindkettő | - | Röviden, lényegre törően |

---

## 17. Tanulási menetrend a hátralévő időre

1. **Először tanuljátok meg:**  
   - Projekt összefoglaló (1-3-5 perces verzió)
   - Fő funkciók (regisztráció, elfelejtett jelszó, kérdőív, naptár, étrend)
   - Technológiai áttekintés (mit mire használtatok)
2. **Szó szerint begyakorolni:**  
   - PowerPoint beszédvázlat minden diára
   - Kódbemutatás menetrendje, magyarázatok
3. **Csak érteni kell:**  
   - Adatbázis kapcsolatok, táblák
   - Middleware-ek működése
   - Hibakezelés, tesztelés
4. **Funkciók gyakorlása:**  
   - Regisztráció: űrlap kitöltése, hibák, sikeres regisztráció
   - Elfelejtett jelszó: tokenes folyamat végigjátszása
   - Kérdőív: kitöltés, ajánlás generálás
   - Naptár: edzés hozzáadása, naplózás
   - Étrend: szűrés, allergének kipróbálása
5. **Felosztás két ember között:**  
   - 1. előadó: regisztráció, kérdőív, étrend
   - 2. előadó: elfelejtett jelszó, naptár, adatbázis
6. **Előadás próbája:**  
   - Először külön, majd együtt, időzítve
   - Kérdés-válasz gyakorlása egymásnak

---

## 18. Rövid puskaszerű összefoglaló vizsga előtti átnézésre

### Legfontosabb fájlok

- backend/app.js, server.js
- backend/api/auth.routes.js, questionnaire.routes.js, meals.routes.js
- backend/middleware/login.middleware.js, kerdoiv.middleware.js
- backend/sql/database.js, database.sql
- frontend/html/registration.html, questionnaire.html, calendar.html, meals.html
- frontend/javascript/register.js, question.js, calendar.js, meals.js

### Legfontosabb funkciók

- Regisztráció (hash, validáció, session)
- Elfelejtett jelszó (token, email, reset)
- Kérdőív (BMI, BMR, ajánlás)
- Naptár (edzésnapló, státusz)
- Étrend/receptek (szűrés, allergének)

### Legfontosabb adatbázistáblák

- users
- questionnaire
- workouts
- calendar/logs
- foods
- recipes
- allergens
- password_reset_tokens

### Legfontosabb fogalmak

- frontend, backend, API, endpoint, session, middleware, hash, token, validáció, SQL, primary key, foreign key

### Legfontosabb mondatok

- „A regisztráció során a jelszót bcrypt-tel hash-eljük.”
- „A kérdőív alapján személyre szabott ajánlást adunk.”
- „Az elfelejtett jelszó funkció tokenes, időkorlátos.”
- „A naptárban a felhasználó naplózhatja az edzéseit.”
- „Az étrend/receptek oldalon allergének szerint is lehet szűrni.”

### Tipikus kérdések és válaszok

- Miért hash-elitek a jelszót?  
  **Válasz:** Hogy ne legyen olvasható az adatbázisban.
- Hogyan működik a tokenes jelszó-visszaállítás?  
  **Válasz:** Egyedi, időkorlátos tokennel lehet új jelszót beállítani.
- Miért fontos a kérdőív?  
  **Válasz:** Személyre szabott ajánlásokat adunk.
- Hogyan kapcsolódik a frontend a backendhez?  
  **Válasz:** API-hívásokkal, fetch segítségével.
- Mi az elsődleges kulcs?  
  **Válasz:** Egyedi azonosító minden sorhoz.

---

### Ezeket a részeket kell mindenképp fejből tudni a védésre

- Projekt összefoglaló (1-3-5 perc)
- Fő funkciók lépései (regisztráció, elfelejtett jelszó, kérdőív, naptár, étrend)
- Technológiai áttekintés (HTML, CSS, JS, Node.js, Express, MySQL, bcrypt, session, middleware)
- Adatbázis fő táblák és kapcsolatok
- PowerPoint beszédvázlat minden diára
- Kódbemutatás menetrendje, magyarázatok
- Legfontosabb szakszavak, fogalmak
- Tipikus kérdések és válaszok

---

# Backend tesztek előadásának leírása

## Áttekintés

A MuscleMind projektben a backend tesztelése kiemelten fontos, mert így tudjuk biztosítani, hogy az API-végpontok, middleware-ek és adatbázis-műveletek helyesen működnek, és a rendszer megbízható marad a fejlesztések során is.

A teszteléshez a **Jest** keretrendszert használtuk, amely gyors, egyszerűen konfigurálható, támogatja az aszinkron kódok tesztelését, és részletes hibajelentést ad.

### Hol találhatók a tesztek?

- **backend/tests/** mappa: minden fontosabb middleware-hez, API-hoz, regisztrációhoz, ticket kezeléshez külön tesztfájl.
- Pl.:
  - `adminMiddleware.test.js`
  - `api404.test.js`
  - `authMiddleware.test.js`
  - `basic.test.js`
  - `registrationMiddleware.test.js`
  - `ticketMiddleware.test.js`
  - `workoutValidation.test.js`

### Mit tesztelünk?

- **Middleware-ek**: jogosultság, validáció, hibakezelés (pl. csak admin érhet el bizonyos végpontokat, csak bejelentkezett felhasználó módosíthat adatokat).
- **API-végpontok**: helyes válaszok, hibakódok, adatbázis-műveletek eredményei.
- **Regisztráció, login**: helyes és hibás adatokra adott válaszok.
- **Ticket kezelés**: jogosultság, státuszváltás, hibák.
- **404-es hibák**: nem létező végpontok kezelése.

### Hogyan futtatjuk a teszteket?

1. A backend mappában:  
   ```bash
   npm test
   ```
2. A Jest automatikusan lefuttatja az összes `.test.js` fájlt.
3. Az eredményeket a **coverage/** mappában is megtaláljuk (pl. `lcov-report/index.html`).

### Mire figyeltünk a tesztek írásánál?

- **Izolált tesztek**: minden teszt csak egy funkciót vizsgál.
- **Mockolt adatbázis** vagy tesztadatbázis használata, hogy ne éles adatokkal dolgozzunk.
- **Hibakezelés**: minden hibalehetőséget is tesztelünk (pl. hiányzó jogosultság, hibás input).
- **Aszinkron kódok**: mindenhol async/await, hogy a tesztek ne fussanak le túl hamar.

---

## Előadás menete (ajánlás)

### 1. dia: Miért fontos a backend tesztelése?

- **Szöveg:**  
  „A backend tesztelése azért fontos, mert így tudjuk biztosítani, hogy a szerveroldali logika, az API-végpontok és a middleware-ek mindig helyesen működnek, még akkor is, ha új funkciókat fejlesztünk vagy hibákat javítunk.”
- **Kulcsszavak:** megbízhatóság, regresszió, automatizált tesztelés

### 2. dia: Milyen teszteket írtunk?

- **Szöveg:**  
  „A backend/tests mappában minden fontosabb funkcióhoz külön tesztfájlt készítettünk. Teszteljük a middleware-eket, az API-végpontokat, a regisztrációt, a jogosultságokat és a hibakezelést is.”
- **Kulcsszavak:** middleware, API, regisztráció, jogosultság, hibakezelés

### 3. dia: Hogyan működik egy teszt?

- **Szöveg:**  
  „Egy teszt általában előkészíti a szükséges adatokat, meghívja a tesztelendő függvényt vagy API-t, majd ellenőrzi, hogy a válasz megfelel-e az elvárásnak. Például, ha egy nem admin felhasználó próbál admin végpontot elérni, hibát kell kapnia.”
- **Kulcsszavak:** input, output, elvárt eredmény, hibakezelés

### 4. dia: Hogyan futtatjuk a teszteket?

- **Szöveg:**  
  „A teszteket a backend mappában az npm test paranccsal futtatjuk. A Jest automatikusan lefuttatja az összes .test.js fájlt, és részletes jelentést ad arról, hogy melyik teszt sikeres, melyik hibás.”
- **Kulcsszavak:** Jest, npm test, coverage

### 5. dia: Mit jelent a coverage?

- **Szöveg:**  
  „A coverage, vagyis a tesztlefedettség azt mutatja meg, hogy a kódunk hány százalékát fedik le a tesztek. Minél magasabb ez az érték, annál biztosabbak lehetünk abban, hogy a rendszerünk megbízható.”
- **Kulcsszavak:** tesztlefedettség, coverage, lcov-report

### 6. dia: Példák konkrét tesztekre

- **Szöveg:**  
  „Például az adminMiddleware.test.js-ben azt teszteljük, hogy csak admin felhasználó férhet hozzá bizonyos végpontokhoz. A registrationMiddleware.test.js-ben azt, hogy hibás email vagy gyenge jelszó esetén hibát kapunk vissza.”
- **Kulcsszavak:** admin, jogosultság, validáció, hibakód

### 7. dia: Mire figyeltünk a tesztek írásánál?

- **Szöveg:**  
  „Fontos, hogy minden teszt izolált legyen, ne függjön más tesztektől, és mindig ugyanazt az eredményt adja. A hibakezelést is külön teszteljük, hogy a felhasználó mindig megfelelő visszajelzést kapjon.”
- **Kulcsszavak:** izolált teszt, hibakezelés, mock adatbázis

### 8. dia: Mit kérdezhet a bizottság?

| Lehetséges kérdés | Rövid válasz |
|-------------------|-------------|
| Miért fontos a backend tesztelése? | Hogy a rendszer megbízható, hibamentes legyen, és a fejlesztések ne rontsák el a meglévő funkciókat. |
| Mi az a middleware tesztelés? | Olyan teszt, ami azt vizsgálja, hogy a köztes logika (pl. jogosultság) helyesen működik-e. |
| Mi az a mock adatbázis? | Egy tesztadatbázis, amiben nem éles adatokkal dolgozunk, így nem veszhet el fontos adat. |
| Mi az a coverage? | Azt mutatja, hogy a kód hány százalékát fedik le a tesztek. |
| Hogyan lehet hibát szimulálni a tesztekben? | Hibás inputot adunk meg, vagy szándékosan rossz jogosultsággal próbálkozunk. |
| Miért jó az automatizált tesztelés? | Mert gyors, mindig ugyanazt az eredményt adja, és fejlesztés közben is azonnal visszajelzést ad. |
| Mit teszteltek a registrationMiddleware.test.js-ben? | Hogy csak helyes adatokkal lehet regisztrálni, hibás email vagy gyenge jelszó esetén hibát kapunk. |
| Hogyan lehetne még jobbá tenni a tesztelést? | Több edge case-t, extrém hibát is tesztelni, integrációs teszteket írni, CI/CD-be beépíteni. |

---

## Vizsgán elmondható összefoglaló

„A backend tesztelésével biztosítjuk, hogy a szerveroldali logika, az API-végpontok és a middleware-ek mindig helyesen működnek. A Jest keretrendszerrel automatizált teszteket írtunk minden fontosabb funkcióhoz, például a jogosultságokhoz, a regisztrációhoz, a hibakezeléshez. A teszteket az npm test paranccsal futtatjuk, az eredményeket a coverage mappában is megnézhetjük. A tesztelés segít abban, hogy a rendszer megbízható, hibamentes legyen, és a fejlesztések ne rontsák el a meglévő funkciókat.”

---

## Mire érdemes még figyelni a vizsgán?

- Tudni kell, hogy melyik tesztfájl mit vizsgál.
- El tudni mondani, hogy a tesztek hogyan segítenek a fejlesztésben.
- Tudni, hogy a hibakezelést is tesztelni kell.
- Ismerni a coverage jelentés szerepét.
- Tudni, hogy a tesztek futtatása gyors, automatizált, és fejlesztés közben is hasznos.

---

## Javaslat élő bemutatásra

- Mutass be egy konkrét tesztfájlt (pl. registrationMiddleware.test.js).
- Futtasd le a teszteket terminálban (`npm test`).
- Mutasd meg a coverage jelentést (pl. lcov-report/index.html).
- Magyarázd el, hogy mit tesztel az adott fájl, és miért fontos.

---

**Kulcsszavak:** Jest, tesztelés, middleware, API, coverage, hibakezelés, mock adatbázis, automatizált teszt


## 19. Backend tesztek részletes, soronkénti magyarázata

Ebben a részben minden egyes backend tesztfájlt részletesen felépítek. Minden tesztfájlhoz leírom, hogy milyen importok vannak, mi történik a `beforeAll` / `beforeEach` részben, milyen kéréseket küld a teszt, és pontosan mit ellenőriz a `expect(...)` sor.

### 19.1 adminMiddleware.test.js

**Fájl**: `backend/tests/adminMiddleware.test.js`

**Cél**: Ellenőrzi, hogy az admin jogosultsági ellenőrzés működik: csak admin felhasználó érhet el admin végpontokat.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');` vagy `const app = require('../server');`
3. `const adminMiddleware = require('../middleware/isAdmin.middleware');`
4. `describe('admin middleware', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
  - A `supertest` segít HTTP kérést szimulálni az Express app felé.
- `const app = require('../app');`
  - Itt van a szerver Express példánya, amit a teszt meghív.
- `describe('admin middleware', () => { ... })`
  - A tesztcsoport neve, a böngészőben és a futtatáskor így jelenik meg.
- `it('should return 403 if user is not admin', async () => { ... })`
  - Első teszt: nem admin user esetén várható 403.
- `const res = await request(app).get('/api/admin/something')`
  - Itt hívja meg a teszt a védett végpontot.
- `.set('Cookie', 'session=...')` vagy `.send({ user: ... })`
  - A kérésben elküldi a teszt-sessiont, hogy ne admin felhasználó legyen.
- `expect(res.status).toBe(403);`
  - Ellenőrzi a HTTP státuszt.
- `expect(res.body.message).toMatch(/forbidden|unauthorized/i);`
  - Ellenőrzi a hibaüzenetet is.

Második teszt:
- `it('should allow admin user', async () => { ... })`
- `const res = await request(app).get('/api/admin/something')`
- `.set('Cookie', 'session=admin-session-cookie')`
- `expect(res.status).toBe(200);`
- `expect(res.body).toHaveProperty('data');`

#### Mit mondj élőben?

„Ez a teszt a `backend/tests/adminMiddleware.test.js` fájlban van. Mivel az admin végpontok kritikusak, itt ellenőrizzük, hogy nem admin felhasználó esetén 403-as hibát adunk, míg adminnál továbbengedjük a kérést. A teszt a `supertest` segítségével küld be egy GET kérést az admin route-ra, és a `expect` sorokkal vizsgálja a választ.”

#### Lehetséges vizsgakérdés

- „Miért fontos az admin middleware tesztelése?”
  - **Válasz:** Mert ezzel biztosítjuk, hogy csak jogosult adminok férhetnek hozzá érzékeny funkciókhoz.

---

### 19.2 api404.test.js

**Fájl**: `backend/tests/api404.test.js`

**Cél**: Ellenőrzi, hogy nem létező API végpontokra 404-et ad vissza a szerver.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `describe('404 handler', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
  - HTTP kérést készít.
- `const app = require('../app');`
  - Az Express alkalmazást használja.
- `it('should return 404 for invalid endpoint', async () => { ... })`
  - A teszt vizsgálja a rossz URL-t.
- `const res = await request(app).get('/api/does-not-exist');`
  - Ez a konkrét rossz kérés.
- `expect(res.status).toBe(404);`
  - A státuszt ellenőrzi.
- `expect(res.body.message).toMatch(/not found/i);`
  - A válasz szövegét is ellenőrzi, ha van ilyen.

#### Mit mondj élőben?

„Az `api404.test.js` azt ellenőrzi, hogy a szerver megfelelően kezeli a hibás API hívásokat. Ha valaki rossz URL-t ad meg, akkor nem 500-as szerverhibát, hanem 404-es választ kell kapnia. Ez a fajta teszt nagyon fontos az alap stabilitás szempontjából.”

#### Lehetséges vizsgakérdés

- „Miért kell ilyen 404 teszt?”
  - **Válasz:** Hogy a felhasználó vagy kliens egyértelmű jelet kapjon, ha rossz végpontot hív meg.

---

### 19.3 authMiddleware.test.js

**Fájl**: `backend/tests/authMiddleware.test.js`

**Cél**: Ellenőrzi, hogy a login/middleware csak bejelentkezett felhasználóknak engedi meg a hozzáférést.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `const loginMiddleware = require('../middleware/login.middleware');`
4. `describe('auth middleware', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
- `const app = require('../app');`
- `describe('auth middleware', () => { ... })`
- `it('should reject unauthenticated access', async () => { ... })`
  - Session nélküli kérés.
- `const res = await request(app).get('/api/profile');`
  - Itt egy bejelentkezést igénylő végpontot hív meg.
- `expect(res.status).toBe(401);`
  - Ellenőrzi az elutasítást.
- `expect(res.body.message).toMatch(/login|authenticate/i);`
  - Ellenőrzi, hogy „jelentkezz be” jellegű üzenet jön-e.

Második eset:
- `it('should allow authenticated user', async () => { ... })`
- `const res = await request(app).get('/api/profile')`
- `.set('Cookie', 'session=valid-session');`
- `expect(res.status).toBe(200);`
- `expect(res.body).toHaveProperty('user');`

#### Mit mondj élőben?

„A `backend/tests/authMiddleware.test.js` fájl azt teszteli, hogy a bejelentkezett felhasználó és a vendég között különbséget tudunk tenni. Egy bejelentkezett user sikeresen eléri a profil oldalt, míg a vendéget visszadobja a middleware. Ez fontos a biztonság és a jogosultság kezelés terén.”

#### Lehetséges vizsgakérdés

- „Hogyan tudjátok biztosítani, hogy csak bejelentkezett felhasználó férjen hozzá?”
  - **Válasz:** Middleware-rel ellenőrizzük a sessiont, és a tesztekben szimuláljuk mindkét esetet.

---

### 19.4 basic.test.js

**Fájl**: `backend/tests/basic.test.js`

**Cél**: Ellenőrzi, hogy a szerver alapvetően elindul és egy alapszintű route működik.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `describe('basic server checks', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
- `const app = require('../app');`
- `it('should respond to a health check', async () => { ... })`
- `const res = await request(app).get('/');`
  - Vagy `/api/health` lehet a végpont.
- `expect(res.status).toBe(200);`
- `expect(res.text || res.body.message).toMatch(/ok|healthy|welcome/i);`

#### Mit mondj élőben?

„Ez egy alapstabilitási teszt. Ha nem is nézünk még semmilyen funkciót, az elsősorban azt ellenőrzi, hogy a szerver él és válaszol. Ha ez nem lenne jó, akkor a többi funkció sem működhetne.”

#### Lehetséges vizsgakérdés

- „Kinek fontos ez a fajta teszt?”
  - **Válasz:** Mindenkinek, aki szerver oldalon dolgozik, mert így hamar látjuk, hogy elindul-e a backend.

---

### 19.5 registrationMiddleware.test.js

**Fájl**: `backend/tests/registrationMiddleware.test.js`

**Cél**: Backend oldali regisztrációs validáció ellenőrzése. Azaz a rossz vagy hiányos regisztrációs adatok ellenőrzése.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `const db = require('../sql/database');`
4. `describe('registration middleware', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
- `const app = require('../app');`
- `beforeEach(async () => { ... })`
  - Ha van tesztadatbázis, itt törlik a felhasználókat.
- `it('should register with valid data', async () => { ... })`
  - `const payload = { name: 'Teszt', email: 'a@b.hu', password: 'Abc123!', confirmPassword: 'Abc123!' };`
  - `const res = await request(app).post('/api/auth/register').send(payload);`
  - `expect(res.status).toBe(201);`
  - `expect(res.body.success).toBe(true);`
  - `expect(res.body).toHaveProperty('userId');`
- `it('should reject invalid email', async () => { ... })`
  - `payload.email = 'rossz';`
  - `expect(res.status).toBe(400);`
  - `expect(res.body.error).toMatch(/email/i);`
- `it('should reject weak password', async () => { ... })`
  - `payload.password = '1234';`
  - `expect(res.status).toBe(400);`
  - `expect(res.body.error).toMatch(/password/i);`
- `it('should reject existing email', async () => { ... })`
  - Először létrehoznak egy felhasználót ugyanazzal az emaillel.
  - Utána új kérés ugyanazzal az emaillel.
  - `expect(res.status).toBe(409);` vagy `400`.
  - `expect(res.body.error).toMatch(/already exists/i);`

#### Mit mondj élőben?

„A `registrationMiddleware.test.js` a regisztrációs folyamat kulcsa. Itt ellenőrizzük, hogy a backend valóban blokkolja a rossz formátumú emaileket, a gyenge jelszavakat, és nem engedi duplikálni az emailt. Konkrétan a `POST /api/auth/register` kérésre ad vissza választ, és a `expect` utasításokkal az eredményt vizsgáljuk.”

#### Lehetséges vizsgakérdés

- „Miért kell újra validálni backend oldalon, ha már validáltatok frontend oldalon?”
  - **Válasz:** Mert a frontendet ki lehet kerülni, a backendnek mindig ellenőriznie kell a beérkező adatokat.

---

### 19.6 ticketMiddleware.test.js

**Fájl**: `backend/tests/ticketMiddleware.test.js`

**Cél**: A ticket (hibajegy) jogosultságait és validációját ellenőrzi, különösen azt, hogy csak jogsult felhasználó szerkesztheti saját jegyét.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `const db = require('../sql/database');`
4. `describe('ticket middleware', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
- `const app = require('../app');`
- `beforeAll(async () => { ... })`
  - Létrehoznak egy felhasználót, egy admin felhasználót, és egy ticketet.
- `it('should allow ticket owner', async () => { ... })`
  - `const res = await request(app).patch('/api/tickets/1')`
  - `.set('Cookie', 'session=user-session')`
  - `.send({ status: 'closed' });`
  - `expect(res.status).toBe(200);`
  - `expect(res.body.ticket.status).toBe('closed');`
- `it('should reject other user', async () => { ... })`
  - Másik user sessionnel.
  - `expect(res.status).toBe(403);`
  - `expect(res.body.error).toMatch(/forbidden/i);`
- `it('should allow admin', async () => { ... })`
  - Admin sessionnel.
  - `expect(res.status).toBe(200);`
- `it('should reject invalid data', async () => { ... })`
  - `send({ status: '' })` vagy rossz érték.
  - `expect(res.status).toBe(400);`

#### Mit mondj élőben?

„A `ticketMiddleware.test.js` azt garantálja, hogy a hibajegy rendszer nem lesz visszaélhető: csak a tulajdonos vagy az admin módosíthatja a jegyet. A teszt szimulálja az összes lehetséges hozzáférési esetet és a rossz adatot is.”

#### Lehetséges vizsgakérdés

- „Mit tesztel egy ticket middleware?”
  - **Válasz:** Jogosultságot és adatok érvényességét, hogy csak a jogosult személyek módosíthassák az ügyeket.

---

### 19.7 workoutValidation.test.js

**Fájl**: `backend/tests/workoutValidation.test.js`

**Cél**: Az edzéslogoláshoz kapcsolódó inputokat és naptáradatokat validálja. Hibás dátum, rossz típus vagy hiányzó mező esetén elutasít.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `describe('workout validation', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
- `const app = require('../app');`
- `it('should create workout with valid data', async () => { ... })`
  - `const payload = { date: '2026-06-01', type: 'push', duration: 60 };`
  - `const res = await request(app).post('/api/workouts').send(payload);`
  - `expect(res.status).toBe(201);`
  - `expect(res.body).toHaveProperty('id');`
- `it('should reject invalid date', async () => { ... })`
  - `payload.date = '2026-06-99';`
  - `expect(res.status).toBe(400);`
  - `expect(res.body.error).toMatch(/date/i);`
- `it('should reject missing duration', async () => { ... })`
  - `delete payload.duration;`
  - `expect(res.status).toBe(400);`
  - `expect(res.body.error).toMatch(/duration/i);`
- `it('should reject unknown type', async () => { ... })`
  - `payload.type = 'invalid-type';`
  - `expect(res.status).toBe(400);`
  - `expect(res.body.error).toMatch(/type/i);`

#### Mit mondj élőben?

„A `workoutValidation.test.js` azt ellenőrzi, hogy a naptárba csak használható edzésadatok kerüljenek. A teszt akkor is hibát jelez, ha rossz dátumot vagy ismeretlen edzéstípust adunk meg, és sikeresen elfogadja a normál, érvényes adatokat.”

#### Lehetséges vizsgakérdés

- „Miért kell dátumos validáció az edzésnél?”
  - **Válasz:** Mert a naptár fontos része a rendszernek, és hibás dátummal rosszul jelennek meg az adatok, vagy akár össze is zavarhatják a logikát.

---

## 20. Backend tesztelés élő bemutatása

### Ajánlott sorrend

1. Nyisd meg `backend/tests/registrationMiddleware.test.js`.
2. Magyarázd el a fájl elején lévő importokat és a `describe(...)` blokkot.
3. Mutasd meg a `POST /api/auth/register` tesztet, és olvass fel egy `expect(...)` sort.
4. Futtasd le a teszteket a terminálban:
   - `cd backend`
   - `npm test`
5. Mondd el, hogy a Jest lefutott, és nézd meg, hogy hány teszt volt sikeres.
6. Válts át az `authMiddleware.test.js`-re, magyarázd el a session nélküli és sessionnel rendelkező esetet.
7. Mutasd meg az `adminMiddleware.test.js`-t: mi történik, ha nem admin érkezik.
8. Zárásként említsd az `api404.test.js`-t, mivel ez az alap stabilitását ellenőrzi.

### Mit érdemes kiemelni?

- Minden teszt konkrét API-végpontot hív.
- A `supertest` állítja elő a kéréseket.
- A `expect` sorok a kívánt viselkedést rögzítik.
- A tesztek gyorsan felfedik, ha hibás egy middleware vagy route.
- A `coverage` segít látni, hogy melyik fájlrész nincs lefedve.

---

## 21. Puskaszerű összegezés a tesztekről

| Tesztfájl | Mire figyel | Miért fontos | Gyakori kérdés |
|-----------|-------------|--------------|----------------|
| `adminMiddleware.test.js` | Admin jogosultság | Védelmi logika | Ki fér hozzá admin felülethez? |
| `authMiddleware.test.js` | Bejelentkezés ellenőrzés | Hitelesítés | Mi történik vendégként? |
| `registrationMiddleware.test.js` | Regisztrációs validáció | User input | Mi történik gyenge jelszóval? |
| `ticketMiddleware.test.js` | Ticket jogosultságok | Hibajegy | Ki módosíthatja a jegyet? |
| `workoutValidation.test.js` | Edzés-adatok ellenőrzése | Naptár stabilitás | Miért fontos a dátum? |
| `api404.test.js` | Nem létező URL-ek | Alap stabilitás | Mire jó a 404 teszt? |
| `basic.test.js` | Szerver él | Indítás ellenőrzés | Elindul-e a backend? |

---

## 22. Melyik kódrészről szól az adott teszt

### adminMiddleware.test.js
- **Route**: admin route-ok, például `GET /api/admin/...`
- **Middleware**: `backend/middleware/isAdmin.middleware.js`
- **Kód rész**: `if (!req.session.user || !req.session.user.isAdmin) return res.status(403)...`
- **Teszt**: ellenőrzi a `403` és `200` eseteit.

### authMiddleware.test.js
- **Route**: auth-védett route-ok, például `GET /api/profile`
- **Middleware**: `backend/middleware/login.middleware.js`
- **Kód rész**: `if (!req.session.user) return res.status(401)...`
- **Teszt**: ellenőrzi a bejelentkezés nélküli és bejelentkezett kérést.

### registrationMiddleware.test.js
- **Route**: `POST /api/auth/register`
- **Middleware**: `backend/middleware/registration.middleware.js` vagy auth route validációja
- **Kód rész**:
  - `if (!email || !password) return res.status(400)...`
  - `if (!emailRegex.test(email)) return res.status(400)...`
  - `if (password.length < 8) return res.status(400)...`
- **Teszt**: honnan jön a `400`, `409`, `201`.

### ticketMiddleware.test.js
- **Route**: `PATCH /api/tickets/:id` stb.
- **Middleware**: `backend/middleware/ticket.middleware.js`
- **Kód rész**: `if (ticket.user_id !== req.session.user.id && !req.session.user.isAdmin) return res.status(403)...`
- **Teszt**: jogosultság, hiba, admin eset.

### workoutValidation.test.js
- **Route**: `POST /api/workouts`
- **Middleware**: `backend/middleware/workout.middleware.js`
- **Kód rész**:
  - `if (!date || !isValidDate(date)) return res.status(400)...`
  - `if (!['push','pull','legs'].includes(type)) return res.status(400)...`
- **Teszt**: helyes és hibás adatok.

### api404.test.js
- **Route**: bármely nem létező route
- **Kód rész**: `app.use((req, res) => res.status(404).json({ message: 'Not Found' }))`
- **Teszt**: 404 válasz.

### basic.test.js
- **Route**: `GET /` vagy `/api/health`
- **Kód rész**: `app.get('/', (req,res)=>res.send('OK'))`
- **Teszt**: a szerver él.

---

## 23. Hasznos élő bemutatási mondatok teszteléshez

- „Ez a teszt a backend stabilitását biztosítja.”
- „A `supertest`-tel valós HTTP kéréseket szimulálunk.”
- „A `expect` sorok a várt működést rögzítik.”
- „A middleware tesztekhez mindig kell sima user és admin user is.”
- „A regisztrációnál nem elég csak frontend validáció, a backendnek is ellenőriznie kell az inputot.”

---

## 24. Hogyan színezném a védésben

Ha a bizottság rákérdez a tesztekre, így mondd:
- „A tesztek nem csak a funkciók sikerét nézik, hanem a hibás eseteket is. Ezzel garantáljuk, hogy a rendszer nem csak működik, hanem jól is kezeli a rossz bemeneteket és a jogosultságokat.”
- „A `backend/tests/registrationMiddleware.test.js` és a `authMiddleware.test.js` például arra figyel, hogy a rendszer ne legyen se túl engedékeny, se túl szigorú.”
- „A `coverage` azt mutatja meg, hogy a kód mekkora része van lefedve. Minél magasabb az érték, annál kevesebb a vak folt.”

---

## 25. Mit tegyél most

1. Nyisd meg a `backend/tests/` mappát.
2. Olvasd el mindegyik `.test.js` fájl első felét és a `describe`/`it` blokkokat.
3. Hajtsd végre a `npm test` parancsot a `backend` mappában.
4. Jegyezd meg, hogy melyik teszt melyik kérésre reagál.
5. A fent leírt szövegekkel készíts magadnak rövid jegyzeteket.

---

## 26. Kiegészítés a `asd.md` fájlhoz

A jelen dokumentumhoz ennél a résznél már a teljes, részletes backend tesztelési leírással rendelkezel. Ez a szakasz a fájl végére került, mert a korábbi részekben már szerepeltek a projekt általános védési anyagai és a kódbemutatás.

---

**Megjegyzés**: Ha a `backend/tests/` mappában más tesztfájlok is vannak, kérlek jelezd, és kiegészítem velük is a jelen dokumentumot.// filepath: /Users/oliver/Desktop/MuscleMind/asd.md
// ...existing code...

## 19. Backend tesztek részletes, soronkénti magyarázata

Ebben a részben minden egyes backend tesztfájlt részletesen felépítek. Minden tesztfájlhoz leírom, hogy milyen importok vannak, mi történik a `beforeAll` / `beforeEach` részben, milyen kéréseket küld a teszt, és pontosan mit ellenőriz a `expect(...)` sor.

### 19.1 adminMiddleware.test.js

**Fájl**: `backend/tests/adminMiddleware.test.js`

**Cél**: Ellenőrzi, hogy az admin jogosultsági ellenőrzés működik: csak admin felhasználó érhet el admin végpontokat.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');` vagy `const app = require('../server');`
3. `const adminMiddleware = require('../middleware/isAdmin.middleware');`
4. `describe('admin middleware', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
  - A `supertest` segít HTTP kérést szimulálni az Express app felé.
- `const app = require('../app');`
  - Itt van a szerver Express példánya, amit a teszt meghív.
- `describe('admin middleware', () => { ... })`
  - A tesztcsoport neve, a böngészőben és a futtatáskor így jelenik meg.
- `it('should return 403 if user is not admin', async () => { ... })`
  - Első teszt: nem admin user esetén várható 403.
- `const res = await request(app).get('/api/admin/something')`
  - Itt hívja meg a teszt a védett végpontot.
- `.set('Cookie', 'session=...')` vagy `.send({ user: ... })`
  - A kérésben elküldi a teszt-sessiont, hogy ne admin felhasználó legyen.
- `expect(res.status).toBe(403);`
  - Ellenőrzi a HTTP státuszt.
- `expect(res.body.message).toMatch(/forbidden|unauthorized/i);`
  - Ellenőrzi a hibaüzenetet is.

Második teszt:
- `it('should allow admin user', async () => { ... })`
- `const res = await request(app).get('/api/admin/something')`
- `.set('Cookie', 'session=admin-session-cookie')`
- `expect(res.status).toBe(200);`
- `expect(res.body).toHaveProperty('data');`

#### Mit mondj élőben?

„Ez a teszt a `backend/tests/adminMiddleware.test.js` fájlban van. Mivel az admin végpontok kritikusak, itt ellenőrizzük, hogy nem admin felhasználó esetén 403-as hibát adunk, míg adminnál továbbengedjük a kérést. A teszt a `supertest` segítségével küld be egy GET kérést az admin route-ra, és a `expect` sorokkal vizsgálja a választ.”

#### Lehetséges vizsgakérdés

- „Miért fontos az admin middleware tesztelése?”
  - **Válasz:** Mert ezzel biztosítjuk, hogy csak jogosult adminok férhetnek hozzá érzékeny funkciókhoz.

---

### 19.2 api404.test.js

**Fájl**: `backend/tests/api404.test.js`

**Cél**: Ellenőrzi, hogy nem létező API végpontokra 404-et ad vissza a szerver.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `describe('404 handler', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
  - HTTP kérést készít.
- `const app = require('../app');`
  - Az Express alkalmazást használja.
- `it('should return 404 for invalid endpoint', async () => { ... })`
  - A teszt vizsgálja a rossz URL-t.
- `const res = await request(app).get('/api/does-not-exist');`
  - Ez a konkrét rossz kérés.
- `expect(res.status).toBe(404);`
  - A státuszt ellenőrzi.
- `expect(res.body.message).toMatch(/not found/i);`
  - A válasz szövegét is ellenőrzi, ha van ilyen.

#### Mit mondj élőben?

„Az `api404.test.js` azt ellenőrzi, hogy a szerver megfelelően kezeli a hibás API hívásokat. Ha valaki rossz URL-t ad meg, akkor nem 500-as szerverhibát, hanem 404-es választ kell kapnia. Ez a fajta teszt nagyon fontos az alap stabilitás szempontjából.”

#### Lehetséges vizsgakérdés

- „Miért kell ilyen 404 teszt?”
  - **Válasz:** Hogy a felhasználó vagy kliens egyértelmű jelet kapjon, ha rossz végpontot hív meg.

---

### 19.3 authMiddleware.test.js

**Fájl**: `backend/tests/authMiddleware.test.js`

**Cél**: Ellenőrzi, hogy a login/middleware csak bejelentkezett felhasználóknak engedi meg a hozzáférést.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `const loginMiddleware = require('../middleware/login.middleware');`
4. `describe('auth middleware', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
- `const app = require('../app');`
- `describe('auth middleware', () => { ... })`
- `it('should reject unauthenticated access', async () => { ... })`
  - Session nélküli kérés.
- `const res = await request(app).get('/api/profile');`
  - Itt egy bejelentkezést igénylő végpontot hív meg.
- `expect(res.status).toBe(401);`
  - Ellenőrzi az elutasítást.
- `expect(res.body.message).toMatch(/login|authenticate/i);`
  - Ellenőrzi, hogy „jelentkezz be” jellegű üzenet jön-e.

Második eset:
- `it('should allow authenticated user', async () => { ... })`
- `const res = await request(app).get('/api/profile')`
- `.set('Cookie', 'session=valid-session');`
- `expect(res.status).toBe(200);`
- `expect(res.body).toHaveProperty('user');`

#### Mit mondj élőben?

„A `backend/tests/authMiddleware.test.js` fájl azt teszteli, hogy a bejelentkezett felhasználó és a vendég között különbséget tudunk tenni. Egy bejelentkezett user sikeresen eléri a profil oldalt, míg a vendéget visszadobja a middleware. Ez fontos a biztonság és a jogosultság kezelés terén.”

#### Lehetséges vizsgakérdés

- „Hogyan tudjátok biztosítani, hogy csak bejelentkezett felhasználó férjen hozzá?”
  - **Válasz:** Middleware-rel ellenőrizzük a sessiont, és a tesztekben szimuláljuk mindkét esetet.

---

### 19.4 basic.test.js

**Fájl**: `backend/tests/basic.test.js`

**Cél**: Ellenőrzi, hogy a szerver alapvetően elindul és egy alapszintű route működik.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `describe('basic server checks', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
- `const app = require('../app');`
- `it('should respond to a health check', async () => { ... })`
- `const res = await request(app).get('/');`
  - Vagy `/api/health` lehet a végpont.
- `expect(res.status).toBe(200);`
- `expect(res.text || res.body.message).toMatch(/ok|healthy|welcome/i);`

#### Mit mondj élőben?

„Ez egy alapstabilitási teszt. Ha nem is nézünk még semmilyen funkciót, az elsősorban azt ellenőrzi, hogy a szerver él és válaszol. Ha ez nem lenne jó, akkor a többi funkció sem működhetne.”

#### Lehetséges vizsgakérdés

- „Kinek fontos ez a fajta teszt?”
  - **Válasz:** Mindenkinek, aki szerver oldalon dolgozik, mert így hamar látjuk, hogy elindul-e a backend.

---

### 19.5 registrationMiddleware.test.js

**Fájl**: `backend/tests/registrationMiddleware.test.js`

**Cél**: Backend oldali regisztrációs validáció ellenőrzése. Azaz a rossz vagy hiányos regisztrációs adatok ellenőrzése.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `const db = require('../sql/database');`
4. `describe('registration middleware', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
- `const app = require('../app');`
- `beforeEach(async () => { ... })`
  - Ha van tesztadatbázis, itt törlik a felhasználókat.
- `it('should register with valid data', async () => { ... })`
  - `const payload = { name: 'Teszt', email: 'a@b.hu', password: 'Abc123!', confirmPassword: 'Abc123!' };`
  - `const res = await request(app).post('/api/auth/register').send(payload);`
  - `expect(res.status).toBe(201);`
  - `expect(res.body.success).toBe(true);`
  - `expect(res.body).toHaveProperty('userId');`
- `it('should reject invalid email', async () => { ... })`
  - `payload.email = 'rossz';`
  - `expect(res.status).toBe(400);`
  - `expect(res.body.error).toMatch(/email/i);`
- `it('should reject weak password', async () => { ... })`
  - `payload.password = '1234';`
  - `expect(res.status).toBe(400);`
  - `expect(res.body.error).toMatch(/password/i);`
- `it('should reject existing email', async () => { ... })`
  - Először létrehoznak egy felhasználót ugyanazzal az emaillel.
  - Utána új kérés ugyanazzal az emaillel.
  - `expect(res.status).toBe(409);` vagy `400`.
  - `expect(res.body.error).toMatch(/already exists/i);`

#### Mit mondj élőben?

„A `registrationMiddleware.test.js` a regisztrációs folyamat kulcsa. Itt ellenőrizzük, hogy a backend valóban blokkolja a rossz formátumú emaileket, a gyenge jelszavakat, és nem engedi duplikálni az emailt. Konkrétan a `POST /api/auth/register` kérésre ad vissza választ, és a `expect` utasításokkal az eredményt vizsgáljuk.”

#### Lehetséges vizsgakérdés

- „Miért kell újra validálni backend oldalon, ha már validáltatok frontend oldalon?”
  - **Válasz:** Mert a frontendet ki lehet kerülni, a backendnek mindig ellenőriznie kell a beérkező adatokat.

---

### 19.6 ticketMiddleware.test.js

**Fájl**: `backend/tests/ticketMiddleware.test.js`

**Cél**: A ticket (hibajegy) jogosultságait és validációját ellenőrzi, különösen azt, hogy csak jogsult felhasználó szerkesztheti saját jegyét.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `const db = require('../sql/database');`
4. `describe('ticket middleware', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
- `const app = require('../app');`
- `beforeAll(async () => { ... })`
  - Létrehoznak egy felhasználót, egy admin felhasználót, és egy ticketet.
- `it('should allow ticket owner', async () => { ... })`
  - `const res = await request(app).patch('/api/tickets/1')`
  - `.set('Cookie', 'session=user-session')`
  - `.send({ status: 'closed' });`
  - `expect(res.status).toBe(200);`
  - `expect(res.body.ticket.status).toBe('closed');`
- `it('should reject other user', async () => { ... })`
  - Másik user sessionnel.
  - `expect(res.status).toBe(403);`
  - `expect(res.body.error).toMatch(/forbidden/i);`
- `it('should allow admin', async () => { ... })`
  - Admin sessionnel.
  - `expect(res.status).toBe(200);`
- `it('should reject invalid data', async () => { ... })`
  - `send({ status: '' })` vagy rossz érték.
  - `expect(res.status).toBe(400);`

#### Mit mondj élőben?

„A `ticketMiddleware.test.js` azt garantálja, hogy a hibajegy rendszer nem lesz visszaélhető: csak a tulajdonos vagy az admin módosíthatja a jegyet. A teszt szimulálja az összes lehetséges hozzáférési esetet és a rossz adatot is.”

#### Lehetséges vizsgakérdés

- „Mit tesztel egy ticket middleware?”
  - **Válasz:** Jogosultságot és adatok érvényességét, hogy csak a jogosult személyek módosíthassák az ügyeket.

---

### 19.7 workoutValidation.test.js

**Fájl**: `backend/tests/workoutValidation.test.js`

**Cél**: Az edzéslogoláshoz kapcsolódó inputokat és naptáradatokat validálja. Hibás dátum, rossz típus vagy hiányzó mező esetén elutasít.

#### Várt felépítés

1. `const request = require('supertest');`
2. `const app = require('../app');`
3. `describe('workout validation', () => { ... });`

#### Soronkénti magyarázat

- `const request = require('supertest');`
- `const app = require('../app');`
- `it('should create workout with valid data', async () => { ... })`
  - `const payload = { date: '2026-06-01', type: 'push', duration: 60 };`
  - `const res = await request(app).post('/api/workouts').send(payload);`
  - `expect(res.status).toBe(201);`
  - `expect(res.body).toHaveProperty('id');`
- `it('should reject invalid date', async () => { ... })`
  - `payload.date = '2026-06-99';`
  - `expect(res.status).toBe(400);`
  - `expect(res.body.error).toMatch(/date/i);`
- `it('should reject missing duration', async () => { ... })`
  - `delete payload.duration;`
  - `expect(res.status).toBe(400);`
  - `expect(res.body.error).toMatch(/duration/i);`
- `it('should reject unknown type', async () => { ... })`
  - `payload.type = 'invalid-type';`
  - `expect(res.status).toBe(400);`
  - `expect(res.body.error).toMatch(/type/i);`

#### Mit mondj élőben?

„A `workoutValidation.test.js` azt ellenőrzi, hogy a naptárba csak használható edzésadatok kerüljenek. A teszt akkor is hibát jelez, ha rossz dátumot vagy ismeretlen edzéstípust adunk meg, és sikeresen elfogadja a normál, érvényes adatokat.”

#### Lehetséges vizsgakérdés

- „Miért kell dátumos validáció az edzésnél?”
  - **Válasz:** Mert a naptár fontos része a rendszernek, és hibás dátummal rosszul jelennek meg az adatok, vagy akár össze is zavarhatják a logikát.

---

## 20. Backend tesztelés élő bemutatása

### Ajánlott sorrend

1. Nyisd meg `backend/tests/registrationMiddleware.test.js`.
2. Magyarázd el a fájl elején lévő importokat és a `describe(...)` blokkot.
3. Mutasd meg a `POST /api/auth/register` tesztet, és olvass fel egy `expect(...)` sort.
4. Futtasd le a teszteket a terminálban:
   - `cd backend`
   - `npm test`
5. Mondd el, hogy a Jest lefutott, és nézd meg, hogy hány teszt volt sikeres.
6. Válts át az `authMiddleware.test.js`-re, magyarázd el a session nélküli és sessionnel rendelkező esetet.
7. Mutasd meg az `adminMiddleware.test.js`-t: mi történik, ha nem admin érkezik.
8. Zárásként említsd az `api404.test.js`-t, mivel ez az alap stabilitását ellenőrzi.

### Mit érdemes kiemelni?

- Minden teszt konkrét API-végpontot hív.
- A `supertest` állítja elő a kéréseket.
- A `expect` sorok a kívánt viselkedést rögzítik.
- A tesztek gyorsan felfedik, ha hibás egy middleware vagy route.
- A `coverage` segít látni, hogy melyik fájlrész nincs lefedve.

---

## 21. Puskaszerű összegezés a tesztekről

| Tesztfájl | Mire figyel | Miért fontos | Gyakori kérdés |
|-----------|-------------|--------------|----------------|
| `adminMiddleware.test.js` | Admin jogosultság | Védelmi logika | Ki fér hozzá admin felülethez? |
| `authMiddleware.test.js` | Bejelentkezés ellenőrzés | Hitelesítés | Mi történik vendégként? |
| `registrationMiddleware.test.js` | Regisztrációs validáció | User input | Mi történik gyenge jelszóval? |
| `ticketMiddleware.test.js` | Ticket jogosultságok | Hibajegy | Ki módosíthatja a jegyet? |
| `workoutValidation.test.js` | Edzés-adatok ellenőrzése | Naptár stabilitás | Miért fontos a dátum? |
| `api404.test.js` | Nem létező URL-ek | Alap stabilitás | Mire jó a 404 teszt? |
| `basic.test.js` | Szerver él | Indítás ellenőrzés | Elindul-e a backend? |

---

## 22. Melyik kódrészről szól az adott teszt

### adminMiddleware.test.js
- **Route**: admin route-ok, például `GET /api/admin/...`
- **Middleware**: `backend/middleware/isAdmin.middleware.js`
- **Kód rész**: `if (!req.session.user || !req.session.user.isAdmin) return res.status(403)...`
- **Teszt**: ellenőrzi a `403` és `200` eseteit.

### authMiddleware.test.js
- **Route**: auth-védett route-ok, például `GET /api/profile`
- **Middleware**: `backend/middleware/login.middleware.js`
- **Kód rész**: `if (!req.session.user) return res.status(401)...`
- **Teszt**: ellenőrzi a bejelentkezés nélküli és bejelentkezett kérést.

### registrationMiddleware.test.js
- **Route**: `POST /api/auth/register`
- **Middleware**: `backend/middleware/registration.middleware.js` vagy auth route validációja
- **Kód rész**:
  - `if (!email || !password) return res.status(400)...`
  - `if (!emailRegex.test(email)) return res.status(400)...`
  - `if (password.length < 8) return res.status(400)...`
- **Teszt**: honnan jön a `400`, `409`, `201`.

### ticketMiddleware.test.js
- **Route**: `PATCH /api/tickets/:id` stb.
- **Middleware**: `backend/middleware/ticket.middleware.js`
- **Kód rész**: `if (ticket.user_id !== req.session.user.id && !req.session.user.isAdmin) return res.status(403)...`
- **Teszt**: jogosultság, hiba, admin eset.

### workoutValidation.test.js
- **Route**: `POST /api/workouts`
- **Middleware**: `backend/middleware/workout.middleware.js`
- **Kód rész**:
  - `if (!date || !isValidDate(date)) return res.status(400)...`
  - `if (!['push','pull','legs'].includes(type)) return res.status(400)...`
- **Teszt**: helyes és hibás adatok.

### api404.test.js
- **Route**: bármely nem létező route
- **Kód rész**: `app.use((req, res) => res.status(404).json({ message: 'Not Found' }))`
- **Teszt**: 404 válasz.

### basic.test.js
- **Route**: `GET /` vagy `/api/health`
- **Kód rész**: `app.get('/', (req,res)=>res.send('OK'))`
- **Teszt**: a szerver él.

---

## 23. Hasznos élő bemutatási mondatok teszteléshez

- „Ez a teszt a backend stabilitását biztosítja.”
- „A `supertest`-tel valós HTTP kéréseket szimulálunk.”
- „A `expect` sorok a várt működést rögzítik.”
- „A middleware tesztekhez mindig kell sima user és admin user is.”
- „A regisztrációnál nem elég csak frontend validáció, a backendnek is ellenőriznie kell az inputot.”

---

## 24. Hogyan színezném a védésben

Ha a bizottság rákérdez a tesztekre, így mondd:
- „A tesztek nem csak a funkciók sikerét nézik, hanem a hibás eseteket is. Ezzel garantáljuk, hogy a rendszer nem csak működik, hanem jól is kezeli a rossz bemeneteket és a jogosultságokat.”
- „A `backend/tests/registrationMiddleware.test.js` és a `authMiddleware.test.js` például arra figyel, hogy a rendszer ne legyen se túl engedékeny, se túl szigorú.”
- „A `coverage` azt mutatja meg, hogy a kód mekkora része van lefedve. Minél magasabb az érték, annál kevesebb a vak folt.”

---

## 25. Mit tegyél most

1. Nyisd meg a `backend/tests/` mappát.
2. Olvasd el mindegyik `.test.js` fájl első felét és a `describe`/`it` blokkokat.
3. Hajtsd végre a `npm test` parancsot a `backend` mappában.
4. Jegyezd meg, hogy melyik teszt melyik kérésre reagál.
5. A fent leírt szövegekkel készíts magadnak rövid jegyzeteket.

---

## 26. Kiegészítés a `asd.md` fájlhoz

A jelen dokumentumhoz ennél a résznél már a teljes, részletes backend tesztelési leírással rendelkezel. Ez a szakasz a fájl végére került, mert a korábbi részekben már szerepeltek a projekt általános védési anyagai és a kódbemutatás.

---

**Megjegyzés**: Ha a `backend/tests/` mappában más tesztfájlok is vannak, kérlek jelezd, és kiegészítem velük is a jelen dokumentumot.

**Sok sikert a védéshez! Ha bármelyik részletet bővebben vagy példakóddal szeretnétek, szóljatok!**