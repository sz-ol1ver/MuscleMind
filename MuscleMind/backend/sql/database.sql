CREATE DATABASE IF NOT EXISTS musclemind
  DEFAULT CHARACTER SET utf8
  COLLATE utf8_hungarian_ci;

USE musclemind;

CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,

    action VARCHAR(100) NOT NULL,
    description TEXT,

    ip_address VARCHAR(45) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    registered BOOLEAN NOT NULL DEFAULT FALSE,
    admin BOOLEAN NOT NULL DEFAULT FALSE,

    active_plan INT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id INT PRIMARY KEY,

    age INT NULL,
    height INT NULL,

    gender ENUM('férfi', 'nő') NULL,

    goal ENUM(
        'tömegnövelés',
        'szálkásítás',
        'szintentartás'
    ) NULL,

    experience_level ENUM(
        'kezdő (0–6 hónap)',
        'középhaladó (6–24 hónap)',
        'haladó (2+ év)'
    ) NULL,

    training_days ENUM(
        '2–3 nap',
        '4 nap',
        '5–6 nap'
    ) NULL,

    training_location ENUM(
        'konditeremben',
        'otthon, súlyzókkal',
        'otthon, saját testsúllyal'
    ) NULL,

    diet_type ENUM(
        'mindenevő',
        'vegetáriánus',
        'vegán'
    ) NULL,

    meals_per_day ENUM(
        '2–3 alkalom',
        '4–5 alkalom',
        '6 vagy több alkalom'
    ) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS user_weights (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    weight DECIMAL(5,1) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WORKOUT --
--? gyakorlatok
CREATE TABLE IF NOT EXISTS exercises(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    muscle_group ENUM(
        'mell',
        'hát',
        'váll',
        'bicepsz',
        'tricepsz',
        'alkar',
        'has',
        'ferde_has',
        'alsó_hát',
        'comb_első',
        'comb_hátsó',
        'farizom',
        'vádli',
        'teljes_test',
        'cardio'
    ) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_plans(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    level ENUM('kezdo', 'kozep', 'halado') DEFAULT NULL,
    location ENUM('gym', 'home_weights', 'home_bodyweight') DEFAULT NULL,
    goal ENUM('tomeg', 'szalkasitas', 'szintentartas') DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    days_count TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_days(
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    day_number TINYINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    isRestDay BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS day_exercises(
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_id INT NOT NULL,
    exercise_id INT NOT NULL,
    exercise_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_calendar_logs(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    workout_plan_id INT NOT NULL,
    workout_day_id INT NOT NULL,
    workout_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_calendar_exercises(
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_calendar_log_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets_done INT NOT NULL,
    reps_done INT NOT NULL,
    weight_done DECIMAL(6,2) NOT NULL
);

-- ALTER TABLES (foreign key)
ALTER TABLE users 
    ADD CONSTRAINT fk_users_active_workout_plan
    FOREIGN KEY (active_plan)
    REFERENCES workout_plans(id)
    ON DELETE SET NULL;

ALTER TABLE user_profiles
    ADD CONSTRAINT fk_user_profiles_users
    FOREIGN KEY (id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE user_weights
    ADD CONSTRAINT fk_user_weights_users
    FOREIGN KEY (user_id)
    REFERENCES user_profiles(id)
    ON DELETE CASCADE;

ALTER TABLE workout_plans
    ADD CONSTRAINT fk_workout_plans_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE workout_days
ADD CONSTRAINT fk_workout_days_workout_plans
    FOREIGN KEY (plan_id)
    REFERENCES workout_plans(id)
    ON DELETE CASCADE;
ALTER TABLE workout_days 
    ADD CONSTRAINT uq_workout_days_plan_day
    UNIQUE (plan_id, day_number);

ALTER TABLE day_exercises
ADD CONSTRAINT fk_day_exercises_workout_days
    FOREIGN KEY (day_id)
    REFERENCES workout_days(id)
    ON DELETE CASCADE,
ADD CONSTRAINT fk_day_exercises_exercise
    FOREIGN KEY (exercise_id)
    REFERENCES exercises(id)
    ON DELETE RESTRICT,
ADD CONSTRAINT uq_day_exercises_unique_per_day
    UNIQUE (day_id, exercise_id),
ADD CONSTRAINT uq_day_exercises_order
    UNIQUE (day_id, exercise_order);

ALTER TABLE workout_calendar_logs
ADD CONSTRAINT fk_workout_calendar_logs_users
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
CONSTRAINT fk_workout_calendar_logs_plans
    FOREIGN KEY (workout_plan_id)
    REFERENCES workout_plans(id)
    ON DELETE CASCADE,
CONSTRAINT fk_workout_calendar_logs_days
    FOREIGN KEY (workout_day_id)
    REFERENCES workout_days(id)
    ON DELETE CASCADE,
CONSTRAINT uq_workout_calendar_logs_user_date
    UNIQUE (user_id, workout_date);

ALTER TABLE workout_calendar_exercises
ADD CONSTRAINT fk_workout_calendar_exercises_log
    FOREIGN KEY (workout_calendar_log_id)
    REFERENCES workout_calendar_logs(id)
    ON DELETE CASCADE,
CONSTRAINT fk_workout_calendar_exercises_exercises
    FOREIGN KEY (exercise_id)
    REFERENCES exercises(id)
    ON DELETE CASCADE,
CONSTRAINT uq_workout_calendar_exercise_unique
    UNIQUE (workout_calendar_log_id, exercise_id);

-- INSERTEK
INSERT INTO exercises (name, muscle_group)
VALUES
-- mell
('Ferde padon csiga tárogatás', 'mell'),
('Lejtős padon csiga mellnyomás', 'mell'),
('Ferde padon rúddal fekvenyomás', 'mell'),
('Fekvenyomás kézisúlyzóval', 'mell'),
('Fekvőtámasz', 'mell'),
('Tolódzkodás mellre döntve', 'mell'),

-- hát
('Csiga lehúzás ferde fogással', 'hát'),
('Ülő evezőgép ferde háttámasz', 'hát'),
('Evezés padon rúddal', 'hát'),
('Egykezes evezés kézisúlyzóval', 'hát'),
('Húzódzkodás', 'hát'),
('Fordított evezés testsúllyal', 'hát'),

-- váll
('Ferde padon csiga vállnyomás', 'váll'),
('Hátsó delt csiga ferde ülés', 'váll'),
('Vállból nyomás rúddal', 'váll'),
('Oldalemelés kézisúlyzóval', 'váll'),
('Kézenállás tartás', 'váll'),
('Pike push-up', 'váll'),

-- bicepsz
('Csiga bicepsz hajlítás', 'bicepsz'),
('Gépi bicepsz hajlítás', 'bicepsz'),
('Rúddal bicepsz hajlítás', 'bicepsz'),
('Kalapács bicepsz kézisúlyzóval', 'bicepsz'),
('Húzódzkodás szűk fogással', 'bicepsz'),
('Bicepsz tartás testsúllyal', 'bicepsz'),

-- tricepsz
('Csiga tricepsz letolás', 'tricepsz'),
('Csiga tricepsz nyújtás fej felett', 'tricepsz'),
('Fekvenyomás szűk fogással', 'tricepsz'),
('Tricepsz kickback kézisúlyzóval', 'tricepsz'),
('Tolódzkodás', 'tricepsz'),
('Szűk fekvőtámasz', 'tricepsz'),

-- alkar
('Csukló hajlítás csigán', 'alkar'),
('Fordított csukló hajlítás csigán', 'alkar'),
('Rúddal csukló hajlítás', 'alkar'),
('Kézisúlyzó tartás', 'alkar'),
('Tárcsa csípés', 'alkar'),
('Rúdon függés', 'alkar'),

-- has
('Csiga hasprés', 'has'),
('Csiga lábemelés', 'has'),
('Súlyozott felülés', 'has'),
('Oldalirányú csavarás kézisúlyzóval', 'has'),
('Plank', 'has'),
('Mountain climbers', 'has'),

-- ferde has
('Csiga oldalsó csavarás', 'ferde_has'),
('Pallof press', 'ferde_has'),
('Orosz csavar kézisúlyzóval', 'ferde_has'),
('Oldalsó plank súlyzóval', 'ferde_has'),
('Oldalsó plank', 'ferde_has'),
('Ferde has V-emelés', 'ferde_has'),

-- alsó hát
('Hátfeszítés csigán', 'alsó_hát'),
('Ülő csiga hátfeszítés', 'alsó_hát'),
('Román felhúzás rúddal', 'alsó_hát'),
('Good morning kézisúlyzóval', 'alsó_hát'),
('Superman tartás', 'alsó_hát'),
('Bird-Dog', 'alsó_hát'),

-- comb elülső
('Lábtolás csigán', 'comb_első'),
('Lábfeszítés csigán', 'comb_első'),
('Rúddal guggolás', 'comb_első'),
('Sétáló kitörés kézisúlyzóval', 'comb_első'),
('Testtömeg guggolás', 'comb_első'),
('Falnál ülés', 'comb_első'),

-- comb hátsó
('Lábhajlítás csigán ülve', 'comb_hátsó'),
('Lábhajlítás csigán fekve', 'comb_hátsó'),
('Egylábas román felhúzás kézisúlyzóval', 'comb_hátsó'),
('Lábhajlítás kézisúlyzóval', 'comb_hátsó'),
('Nordic hamstring curl', 'comb_hátsó'),
('Egylábas farizom emelés testsúllyal', 'comb_hátsó'),

-- farizom
('Csípőnyomás csigán', 'farizom'),
('Kickback csigán', 'farizom'),
('Hip thrust rúddal', 'farizom'),
('Lépés padra kézisúlyzóval', 'farizom'),
('Glute bridge testsúllyal', 'farizom'),
('Donkey kicks testsúllyal', 'farizom'),

-- vádli
('Ülő vádli csigán', 'vádli'),
('Álló vádli csigán', 'vádli'),
('Álló rúddal vádli emelés', 'vádli'),
('Kézisúlyzóval vádli emelés', 'vádli'),
('Testtömeg vádli emelés', 'vádli'),
('Ugrókötél vádli edzés', 'vádli'),

-- teljes test
('Felhúzás rúddal', 'teljes_test'),
('Guggolás rúddal', 'teljes_test'),
('Clean & Press rúddal', 'teljes_test'),
('Burpee testsúllyal', 'teljes_test'),
('Kettlebell swing', 'teljes_test'),
('Farmer walk kézisúlyzóval', 'teljes_test'),
-- cardio
('Futópad', 'cardio'),
('Lépcsőző gép', 'cardio'),
('Elliptikus tréner', 'cardio'),
('Szobakerékpár', 'cardio'),
('Evezőgép', 'cardio');

-- INSERT recommended plans (for testing)
INSERT INTO workout_plans (user_id, name, level, location, goal, description, is_public, days_count)
SELECT
    NULL AS user_id,
    CONCAT('N', d.days_count, '-', l.level_code, '-', x.loc_code) AS name,
    l.level,
    x.location,
    CASE
        WHEN d.days_count IN (1, 4, 7) THEN 'szintentartas'
        WHEN d.days_count IN (2, 5) THEN 'tomeg'
        WHEN d.days_count IN (3, 6) THEN 'szalkasitas'
    END AS goal,
    CASE
        WHEN l.level = 'kezdo' THEN
            CONCAT(
                x.desc_prefix,
                ' rövid, teljes testet lefedő ciklus. Cél: ',
                CASE
                    WHEN d.days_count IN (1, 4, 7) THEN 'szintentartás'
                    WHEN d.days_count IN (2, 5) THEN 'tömegnövelés'
                    WHEN d.days_count IN (3, 6) THEN 'szálkásítás'
                END,
                '. Ajánlás: alapgyakorlatból 2 szett 6-10 ism., izolációból 2 szett 10-12 ism., hasra/cardióra 2 szett 10-15 ism.'
            )
        WHEN l.level = 'kozep' THEN
            CONCAT(
                x.desc_prefix,
                ' kiegyensúlyozott, teljes testet lefedő ciklus. Cél: ',
                CASE
                    WHEN d.days_count IN (1, 4, 7) THEN 'szintentartás'
                    WHEN d.days_count IN (2, 5) THEN 'tömegnövelés'
                    WHEN d.days_count IN (3, 6) THEN 'szálkásítás'
                END,
                '. Ajánlás: alapgyakorlatból 3 szett 6-10 ism., izolációból 2-3 szett 8-12 ism., hasra/cardióra 2-3 szett 10-15 ism.'
            )
        WHEN l.level = 'halado' THEN
            CONCAT(
                x.desc_prefix,
                ' sűrűbb, teljes testet lefedő ciklus. Cél: ',
                CASE
                    WHEN d.days_count IN (1, 4, 7) THEN 'szintentartás'
                    WHEN d.days_count IN (2, 5) THEN 'tömegnövelés'
                    WHEN d.days_count IN (3, 6) THEN 'szálkásítás'
                END,
                '. Ajánlás: alapgyakorlatból 3-4 szett 5-8 ism., izolációból 2-3 szett 8-12 ism., testsúlyos/cardio elemekből 2-3 szett 10-15 ism.'
            )
    END AS description,
    TRUE AS is_public,
    d.days_count
FROM
    (
        SELECT 1 AS days_count UNION ALL
        SELECT 2 UNION ALL
        SELECT 3 UNION ALL
        SELECT 4 UNION ALL
        SELECT 5 UNION ALL
        SELECT 6 UNION ALL
        SELECT 7
    ) d
CROSS JOIN
    (
        SELECT 'kezdo' AS level, 'K' AS level_code
        UNION ALL
        SELECT 'kozep', 'Z'
        UNION ALL
        SELECT 'halado', 'H'
    ) l
CROSS JOIN
    (
        SELECT 'gym' AS location, 'GYM' AS loc_code, 'Konditermi' AS desc_prefix
        UNION ALL
        SELECT 'home_weights', 'HWT', 'Otthoni súlyzós'
        UNION ALL
        SELECT 'home_bodyweight', 'HBW', 'Otthoni testsúlyos'
    ) x;

INSERT INTO workout_days (plan_id, day_number, name, isRestDay)
SELECT
    wp.id,
    dd.day_number,
    dd.day_name,
    dd.is_rest
FROM workout_plans wp
JOIN (
    SELECT 1 AS days_count, 1 AS day_number, 'Full Body' AS day_name, FALSE AS is_rest

    UNION ALL
    SELECT 2, 1, 'Upper', FALSE
    UNION ALL
    SELECT 2, 2, 'Lower', FALSE

    UNION ALL
    SELECT 3, 1, 'Push', FALSE
    UNION ALL
    SELECT 3, 2, 'Pull', FALSE
    UNION ALL
    SELECT 3, 3, 'Legs', FALSE

    UNION ALL
    SELECT 4, 1, 'Push', FALSE
    UNION ALL
    SELECT 4, 2, 'Pull', FALSE
    UNION ALL
    SELECT 4, 3, 'Rest', TRUE
    UNION ALL
    SELECT 4, 4, 'Legs + Core', FALSE

    UNION ALL
    SELECT 5, 1, 'Push', FALSE
    UNION ALL
    SELECT 5, 2, 'Pull', FALSE
    UNION ALL
    SELECT 5, 3, 'Legs', FALSE
    UNION ALL
    SELECT 5, 4, 'Rest', TRUE
    UNION ALL
    SELECT 5, 5, 'Full Body', FALSE

    UNION ALL
    SELECT 6, 1, 'Push', FALSE
    UNION ALL
    SELECT 6, 2, 'Pull', FALSE
    UNION ALL
    SELECT 6, 3, 'Legs', FALSE
    UNION ALL
    SELECT 6, 4, 'Rest', TRUE
    UNION ALL
    SELECT 6, 5, 'Upper', FALSE
    UNION ALL
    SELECT 6, 6, 'Lower + Core', FALSE

    UNION ALL
    SELECT 7, 1, 'Push', FALSE
    UNION ALL
    SELECT 7, 2, 'Pull', FALSE
    UNION ALL
    SELECT 7, 3, 'Legs', FALSE
    UNION ALL
    SELECT 7, 4, 'Rest', TRUE
    UNION ALL
    SELECT 7, 5, 'Upper', FALSE
    UNION ALL
    SELECT 7, 6, 'Lower', FALSE
    UNION ALL
    SELECT 7, 7, 'Full Body', FALSE
) dd
    ON dd.days_count = wp.days_count;

INSERT INTO day_exercises (day_id, exercise_id, exercise_order)
SELECT
    wd.id,
    e.id,
    m.exercise_order
FROM workout_plans wp
JOIN workout_days wd
    ON wd.plan_id = wp.id
JOIN (
    /* =========================
       GYM
       ========================= */
    SELECT 'gym' AS location, 'Full Body' AS day_name, 1 AS exercise_order, 'Rúddal guggolás' AS exercise_name
    UNION ALL SELECT 'gym', 'Full Body', 2, 'Fekvenyomás kézisúlyzóval'
    UNION ALL SELECT 'gym', 'Full Body', 3, 'Csiga lehúzás ferde fogással'
    UNION ALL SELECT 'gym', 'Full Body', 4, 'Vállból nyomás rúddal'
    UNION ALL SELECT 'gym', 'Full Body', 5, 'Hip thrust rúddal'
    UNION ALL SELECT 'gym', 'Full Body', 6, 'Csiga hasprés'

    UNION ALL SELECT 'gym', 'Upper', 1, 'Ferde padon rúddal fekvenyomás'
    UNION ALL SELECT 'gym', 'Upper', 2, 'Ülő evezőgép ferde háttámasz'
    UNION ALL SELECT 'gym', 'Upper', 3, 'Vállból nyomás rúddal'
    UNION ALL SELECT 'gym', 'Upper', 4, 'Rúddal bicepsz hajlítás'
    UNION ALL SELECT 'gym', 'Upper', 5, 'Csiga tricepsz letolás'

    UNION ALL SELECT 'gym', 'Lower', 1, 'Rúddal guggolás'
    UNION ALL SELECT 'gym', 'Lower', 2, 'Román felhúzás rúddal'
    UNION ALL SELECT 'gym', 'Lower', 3, 'Hip thrust rúddal'
    UNION ALL SELECT 'gym', 'Lower', 4, 'Álló rúddal vádli emelés'
    UNION ALL SELECT 'gym', 'Lower', 5, 'Csiga hasprés'

    UNION ALL SELECT 'gym', 'Push', 1, 'Ferde padon rúddal fekvenyomás'
    UNION ALL SELECT 'gym', 'Push', 2, 'Vállból nyomás rúddal'
    UNION ALL SELECT 'gym', 'Push', 3, 'Oldalemelés kézisúlyzóval'
    UNION ALL SELECT 'gym', 'Push', 4, 'Fekvenyomás szűk fogással'

    UNION ALL SELECT 'gym', 'Pull', 1, 'Csiga lehúzás ferde fogással'
    UNION ALL SELECT 'gym', 'Pull', 2, 'Evezés padon rúddal'
    UNION ALL SELECT 'gym', 'Pull', 3, 'Hátsó delt csiga ferde ülés'
    UNION ALL SELECT 'gym', 'Pull', 4, 'Rúddal bicepsz hajlítás'
    UNION ALL SELECT 'gym', 'Pull', 5, 'Csukló hajlítás csigán'

    UNION ALL SELECT 'gym', 'Legs', 1, 'Rúddal guggolás'
    UNION ALL SELECT 'gym', 'Legs', 2, 'Román felhúzás rúddal'
    UNION ALL SELECT 'gym', 'Legs', 3, 'Lábhajlítás csigán fekve'
    UNION ALL SELECT 'gym', 'Legs', 4, 'Hip thrust rúddal'
    UNION ALL SELECT 'gym', 'Legs', 5, 'Álló rúddal vádli emelés'

    UNION ALL SELECT 'gym', 'Legs + Core', 1, 'Lábtolás csigán'
    UNION ALL SELECT 'gym', 'Legs + Core', 2, 'Lábhajlítás csigán ülve'
    UNION ALL SELECT 'gym', 'Legs + Core', 3, 'Hip thrust rúddal'
    UNION ALL SELECT 'gym', 'Legs + Core', 4, 'Álló rúddal vádli emelés'
    UNION ALL SELECT 'gym', 'Legs + Core', 5, 'Pallof press'

    UNION ALL SELECT 'gym', 'Lower + Core', 1, 'Rúddal guggolás'
    UNION ALL SELECT 'gym', 'Lower + Core', 2, 'Román felhúzás rúddal'
    UNION ALL SELECT 'gym', 'Lower + Core', 3, 'Hip thrust rúddal'
    UNION ALL SELECT 'gym', 'Lower + Core', 4, 'Csiga hasprés'
    UNION ALL SELECT 'gym', 'Lower + Core', 5, 'Pallof press'

    /* =========================
       HOME WEIGHTS
       ========================= */
    UNION ALL SELECT 'home_weights', 'Full Body', 1, 'Sétáló kitörés kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Full Body', 2, 'Fekvenyomás kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Full Body', 3, 'Egykezes evezés kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Full Body', 4, 'Oldalemelés kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Full Body', 5, 'Kalapács bicepsz kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Full Body', 6, 'Orosz csavar kézisúlyzóval'

    UNION ALL SELECT 'home_weights', 'Upper', 1, 'Fekvenyomás kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Upper', 2, 'Egykezes evezés kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Upper', 3, 'Oldalemelés kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Upper', 4, 'Kalapács bicepsz kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Upper', 5, 'Tricepsz kickback kézisúlyzóval'

    UNION ALL SELECT 'home_weights', 'Lower', 1, 'Sétáló kitörés kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Lower', 2, 'Egylábas román felhúzás kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Lower', 3, 'Lépés padra kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Lower', 4, 'Kézisúlyzóval vádli emelés'
    UNION ALL SELECT 'home_weights', 'Lower', 5, 'Plank'

    UNION ALL SELECT 'home_weights', 'Push', 1, 'Fekvenyomás kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Push', 2, 'Oldalemelés kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Push', 3, 'Tricepsz kickback kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Push', 4, 'Pike push-up'

    UNION ALL SELECT 'home_weights', 'Pull', 1, 'Egykezes evezés kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Pull', 2, 'Kalapács bicepsz kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Pull', 3, 'Kézisúlyzó tartás'
    UNION ALL SELECT 'home_weights', 'Pull', 4, 'Farmer walk kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Pull', 5, 'Bird-Dog'

    UNION ALL SELECT 'home_weights', 'Legs', 1, 'Sétáló kitörés kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Legs', 2, 'Egylábas román felhúzás kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Legs', 3, 'Lépés padra kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Legs', 4, 'Glute bridge testsúllyal'
    UNION ALL SELECT 'home_weights', 'Legs', 5, 'Kézisúlyzóval vádli emelés'

    UNION ALL SELECT 'home_weights', 'Legs + Core', 1, 'Sétáló kitörés kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Legs + Core', 2, 'Lábhajlítás kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Legs + Core', 3, 'Lépés padra kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Legs + Core', 4, 'Plank'
    UNION ALL SELECT 'home_weights', 'Legs + Core', 5, 'Orosz csavar kézisúlyzóval'

    UNION ALL SELECT 'home_weights', 'Lower + Core', 1, 'Egylábas román felhúzás kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Lower + Core', 2, 'Lábhajlítás kézisúlyzóval'
    UNION ALL SELECT 'home_weights', 'Lower + Core', 3, 'Glute bridge testsúllyal'
    UNION ALL SELECT 'home_weights', 'Lower + Core', 4, 'Plank'
    UNION ALL SELECT 'home_weights', 'Lower + Core', 5, 'Orosz csavar kézisúlyzóval'

    /* =========================
       HOME BODYWEIGHT
       ========================= */
    UNION ALL SELECT 'home_bodyweight', 'Full Body', 1, 'Fekvőtámasz'
    UNION ALL SELECT 'home_bodyweight', 'Full Body', 2, 'Fordított evezés testsúllyal'
    UNION ALL SELECT 'home_bodyweight', 'Full Body', 3, 'Testtömeg guggolás'
    UNION ALL SELECT 'home_bodyweight', 'Full Body', 4, 'Pike push-up'
    UNION ALL SELECT 'home_bodyweight', 'Full Body', 5, 'Glute bridge testsúllyal'
    UNION ALL SELECT 'home_bodyweight', 'Full Body', 6, 'Plank'

    UNION ALL SELECT 'home_bodyweight', 'Upper', 1, 'Fekvőtámasz'
    UNION ALL SELECT 'home_bodyweight', 'Upper', 2, 'Húzódzkodás'
    UNION ALL SELECT 'home_bodyweight', 'Upper', 3, 'Fordított evezés testsúllyal'
    UNION ALL SELECT 'home_bodyweight', 'Upper', 4, 'Pike push-up'
    UNION ALL SELECT 'home_bodyweight', 'Upper', 5, 'Szűk fekvőtámasz'

    UNION ALL SELECT 'home_bodyweight', 'Lower', 1, 'Testtömeg guggolás'
    UNION ALL SELECT 'home_bodyweight', 'Lower', 2, 'Nordic hamstring curl'
    UNION ALL SELECT 'home_bodyweight', 'Lower', 3, 'Glute bridge testsúllyal'
    UNION ALL SELECT 'home_bodyweight', 'Lower', 4, 'Testtömeg vádli emelés'
    UNION ALL SELECT 'home_bodyweight', 'Lower', 5, 'Oldalsó plank'

    UNION ALL SELECT 'home_bodyweight', 'Push', 1, 'Fekvőtámasz'
    UNION ALL SELECT 'home_bodyweight', 'Push', 2, 'Pike push-up'
    UNION ALL SELECT 'home_bodyweight', 'Push', 3, 'Tolódzkodás'
    UNION ALL SELECT 'home_bodyweight', 'Push', 4, 'Szűk fekvőtámasz'

    UNION ALL SELECT 'home_bodyweight', 'Pull', 1, 'Húzódzkodás'
    UNION ALL SELECT 'home_bodyweight', 'Pull', 2, 'Húzódzkodás szűk fogással'
    UNION ALL SELECT 'home_bodyweight', 'Pull', 3, 'Fordított evezés testsúllyal'
    UNION ALL SELECT 'home_bodyweight', 'Pull', 4, 'Rúdon függés'

    UNION ALL SELECT 'home_bodyweight', 'Legs', 1, 'Testtömeg guggolás'
    UNION ALL SELECT 'home_bodyweight', 'Legs', 2, 'Nordic hamstring curl'
    UNION ALL SELECT 'home_bodyweight', 'Legs', 3, 'Glute bridge testsúllyal'
    UNION ALL SELECT 'home_bodyweight', 'Legs', 4, 'Testtömeg vádli emelés'

    UNION ALL SELECT 'home_bodyweight', 'Legs + Core', 1, 'Testtömeg guggolás'
    UNION ALL SELECT 'home_bodyweight', 'Legs + Core', 2, 'Nordic hamstring curl'
    UNION ALL SELECT 'home_bodyweight', 'Legs + Core', 3, 'Glute bridge testsúllyal'
    UNION ALL SELECT 'home_bodyweight', 'Legs + Core', 4, 'Oldalsó plank'
    UNION ALL SELECT 'home_bodyweight', 'Legs + Core', 5, 'Bird-Dog'

    UNION ALL SELECT 'home_bodyweight', 'Lower + Core', 1, 'Testtömeg guggolás'
    UNION ALL SELECT 'home_bodyweight', 'Lower + Core', 2, 'Glute bridge testsúllyal'
    UNION ALL SELECT 'home_bodyweight', 'Lower + Core', 3, 'Testtömeg vádli emelés'
    UNION ALL SELECT 'home_bodyweight', 'Lower + Core', 4, 'Plank'
    UNION ALL SELECT 'home_bodyweight', 'Lower + Core', 5, 'Superman tartás'
) m
    ON m.location = wp.location
   AND m.day_name = wd.name
JOIN exercises e
    ON e.name = m.exercise_name
WHERE wd.isRestDay = FALSE;