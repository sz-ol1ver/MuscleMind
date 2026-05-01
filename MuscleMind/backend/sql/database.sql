CREATE DATABASE IF NOT EXISTS musclemind
  DEFAULT CHARACTER SET utf8
  COLLATE utf8_hungarian_ci;

USE musclemind;

CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NULL,
    username VARCHAR(50) NULL,

    action VARCHAR(100) NOT NULL,
    description TEXT,

    type ENUM('info', 'warning', 'error') DEFAULT 'info',

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
    active BOOLEAN NOT NULL DEFAULT TRUE,

    active_plan INT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id INT PRIMARY KEY,

    birth_date DATE NULL,
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

CREATE TABLE user_metrics (
    user_id INT PRIMARY KEY,

    bmi DECIMAL(5,2) NOT NULL,
    bmr INT NOT NULL,
    tdee DECIMAL(6,2) NOT NULL,

    goal_calories INT NOT NULL,

    protein_recommended DECIMAL(5,2) NOT NULL,

    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- WORKOUT --
-- workout - stats
CREATE TABLE IF NOT EXISTS user_muscle_xp (
    user_id INT NOT NULL,

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
        'teljes_test'
    ) NOT NULL,

    xp INT NOT NULL DEFAULT 0,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_global_xp (
    user_id INT PRIMARY KEY,
    xp INT NOT NULL DEFAULT 0,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_daily_stats (
    user_id INT NOT NULL,
    stat_date DATE NOT NULL,

    completed_workouts INT NOT NULL DEFAULT 0,
    total_volume DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_sets INT NOT NULL DEFAULT 0,
    total_reps INT NOT NULL DEFAULT 0,
    total_workout_time_sec INT NOT NULL DEFAULT 0,

    xp_gained INT NOT NULL DEFAULT 0,
    prs_achieved INT NOT NULL DEFAULT 0,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_stats (
    user_id INT PRIMARY KEY,

    completed_workouts INT NOT NULL DEFAULT 0,
    total_volume DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_sets INT NOT NULL DEFAULT 0,
    total_reps INT NOT NULL DEFAULT 0,
    pr_count INT NOT NULL DEFAULT 0,
    total_workout_time_sec INT NOT NULL DEFAULT 0,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_exercise_prs (
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,

    max_weight DECIMAL(6,2) NOT NULL DEFAULT 0,
    max_weight_reps INT DEFAULT NULL,
    best_volume DECIMAL(10,2) NOT NULL DEFAULT 0,

    achieved_at DATETIME DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- workout - plans
-- gyakorlatok
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
        'teljes_test'
    ) NOT NULL,
    bodyweight BOOLEAN DEFAULT FALSE,
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

-- workout - calendar
CREATE TABLE IF NOT EXISTS workout_calendar_logs(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    workout_plan_id INT NOT NULL,
    workout_day_id INT NOT NULL,
    workout_date DATE NOT NULL,
    start_time DATETIME DEFAULT NULL,
    workout_time_sec INT NOT NULL DEFAULT 0,
    status ENUM('pending', 'started', 'completed', 'missed', 'rest')NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_calendar_exercises(
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_calendar_log_id INT NOT NULL,
    exercise_id INT NOT NULL,
    exercise_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_calendar_sets(
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_calendar_exercise_id INT NOT NULL,
    set_number INT NOT NULL,
    reps_done INT NOT NULL,
    weight_done DECIMAL(6,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FOODS
CREATE TABLE IF NOT EXISTS foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,

    -- alap adatok
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,

    category ENUM(
        'reggeli',
        'ebed',
        'vacsora',
        'snack',
        'desszert',
        'ital'
    ) NOT NULL,

    created_by INT DEFAULT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,

    -- tápértékek (100g / 100ml alap)
    calories_kcal DECIMAL(8,2) NOT NULL,
    protein_g DECIMAL(8,2) NOT NULL,
    carbs_g DECIMAL(8,2) NOT NULL,
    fat_g DECIMAL(8,2) NOT NULL,
    fiber_g DECIMAL(8,2) DEFAULT 0,
    sugar_g DECIMAL(8,2) DEFAULT 0,
    salt_g DECIMAL(8,2) DEFAULT 0,

    -- adagolás
    serving_size DECIMAL(8,2) NOT NULL,
    serving_unit ENUM(
        'g',
        'ml',
        'db',
        'szelet',
        'tal',
        'pohar',
        'adag'
    ) NOT NULL DEFAULT 'g',

    -- ajánló címkék
    goal_tag ENUM(
        'tomegnoveles',
        'szalkasitas',
        'szintentartas',
        'mind'
    ) NOT NULL DEFAULT 'mind',

    diet_tag ENUM(
        'mindenevo',
        'vegetarianus',
        'vegan'
    ) NOT NULL DEFAULT 'mindenevo',

    difficulty ENUM(
        'konnyu',
        'kozepes',
        'nehez'
    ) NOT NULL DEFAULT 'konnyu',

    prep_time_min INT DEFAULT NULL,

    high_protein BOOLEAN NOT NULL DEFAULT FALSE,
    low_carb BOOLEAN NOT NULL DEFAULT FALSE,
    bulk_friendly BOOLEAN NOT NULL DEFAULT FALSE,
    cut_friendly BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS allergens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS food_allergens (
    food_id INT NOT NULL,
    allergen_id INT NOT NULL,
    PRIMARY KEY (food_id, allergen_id)
);

-- FRIENDS
CREATE TABLE IF NOT EXISTS user_friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    requested_by INT NOT NULL,

    status ENUM('pending', 'accepted', 'rejected', 'blocked') NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL DEFAULT NULL
);
-- ticket support
CREATE TABLE IF NOT EXISTS support_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    email VARCHAR(150) NOT NULL,

    category ENUM('contact', 'bug', 'idea') NOT NULL,
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,

    admin_reply TEXT DEFAULT NULL,

    status ENUM('open', 'seen', 'closed', 'closed_no_reply') NOT NULL DEFAULT 'open',

    related_request_id INT DEFAULT NULL,

    replied_by_admin_id INT DEFAULT NULL,
    replied_at TIMESTAMP NULL DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- store reset-password token
CREATE TABLE IF NOT EXISTS reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    token_hash VARCHAR(64) NOT NULL,

    expires_at DATETIME NOT NULL DEFAULT (NOW() + INTERVAL 10 MINUTE),

    used BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(token_hash)
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

ALTER TABLE user_metrics
    ADD CONSTRAINT fk_user_metrics_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE user_weights
    ADD CONSTRAINT fk_user_weights_users
    FOREIGN KEY (user_id)
    REFERENCES user_profiles(id)
    ON DELETE CASCADE;

ALTER TABLE user_muscle_xp
    ADD PRIMARY KEY (user_id, muscle_group);

ALTER TABLE user_muscle_xp
    ADD CONSTRAINT fk_user_muscle_xp_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE user_global_xp
    ADD CONSTRAINT fk_user_global_xp_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE user_daily_stats
    ADD PRIMARY KEY (user_id, stat_date);

ALTER TABLE user_daily_stats
    ADD CONSTRAINT fk_user_daily_stats_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
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
ADD CONSTRAINT fk_workout_calendar_logs_plans
    FOREIGN KEY (workout_plan_id)
    REFERENCES workout_plans(id)
    ON DELETE CASCADE,
ADD CONSTRAINT fk_workout_calendar_logs_days
    FOREIGN KEY (workout_day_id)
    REFERENCES workout_days(id)
    ON DELETE CASCADE,
ADD CONSTRAINT uq_workout_calendar_logs_user_date
    UNIQUE (user_id, workout_date);

ALTER TABLE foods
ADD CONSTRAINT fk_foods_users
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE SET NULL;
ALTER TABLE foods
ADD CONSTRAINT fk_user_id
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE food_allergens
ADD CONSTRAINT fk_food_allergens_food
    FOREIGN KEY (food_id)
    REFERENCES foods(id)
    ON DELETE CASCADE,
ADD CONSTRAINT fk_food_allergens_allergen
    FOREIGN KEY (allergen_id)
    REFERENCES allergens(id)
    ON DELETE CASCADE;

ALTER TABLE workout_calendar_exercises
ADD CONSTRAINT fk_workout_calendar_exercises_log
    FOREIGN KEY (workout_calendar_log_id)
    REFERENCES workout_calendar_logs(id)
    ON DELETE CASCADE,
ADD CONSTRAINT fk_workout_calendar_exercises_exercise
    FOREIGN KEY (exercise_id)
    REFERENCES exercises(id)
    ON DELETE CASCADE,
ADD CONSTRAINT uq_workout_calendar_exercise_unique
    UNIQUE (workout_calendar_log_id, exercise_id);

ALTER TABLE workout_calendar_sets
ADD CONSTRAINT fk_workout_calendar_sets_exercise
    FOREIGN KEY (workout_calendar_exercise_id)
    REFERENCES workout_calendar_exercises(id)
    ON DELETE CASCADE,
ADD CONSTRAINT uq_workout_calendar_sets_number
    UNIQUE (workout_calendar_exercise_id, set_number);

ALTER TABLE user_exercise_prs
    ADD PRIMARY KEY (user_id, exercise_id);

ALTER TABLE user_exercise_prs
    ADD CONSTRAINT fk_user_exercise_prs_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE user_exercise_prs
    ADD CONSTRAINT fk_user_exercise_prs_exercise
    FOREIGN KEY (exercise_id)
    REFERENCES exercises(id)
    ON DELETE CASCADE;

ALTER TABLE user_friendships
ADD CONSTRAINT chk_user_order CHECK (user1_id < user2_id),
ADD CONSTRAINT chk_no_self_friendship CHECK (user1_id <> user2_id),
ADD CONSTRAINT uq_user_friendship UNIQUE (user1_id, user2_id),
ADD CONSTRAINT fk_user_friendships_user1
    FOREIGN KEY (user1_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
ADD CONSTRAINT fk_user_friendships_user2
    FOREIGN KEY (user2_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
ADD CONSTRAINT fk_user_friendships_requested_by
    FOREIGN KEY (requested_by)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE user_stats
ADD CONSTRAINT fk_user_stats_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;
    
ALTER TABLE support_requests
    ADD CONSTRAINT fk_support_requests_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
    ADD CONSTRAINT fk_support_requests_related
    FOREIGN KEY (related_request_id)
    REFERENCES support_requests(id)
    ON DELETE SET NULL,
    ADD CONSTRAINT fk_support_requests_admin
    FOREIGN KEY (replied_by_admin_id)
    REFERENCES users(id)
    ON DELETE SET NULL;

ALTER TABLE reset_tokens
    ADD CONSTRAINT fk_password_reset_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- INSERTEK
INSERT INTO exercises (name, muscle_group, bodyweight)
VALUES
    -- mell
    ('Ferde padon csiga tárogatás', 'mell', FALSE),
    ('Lejtős padon csiga mellnyomás', 'mell', FALSE),
    ('Ferde padon rúddal fekvenyomás', 'mell', FALSE),
    ('Fekvenyomás kézisúlyzóval', 'mell', FALSE),
    ('Fekvőtámasz', 'mell', TRUE),
    ('Tolódzkodás mellre döntve', 'mell', TRUE),

    -- hát
    ('Csiga lehúzás ferde fogással', 'hát', FALSE),
    ('Ülő evezőgép ferde háttámasz', 'hát', FALSE),
    ('Evezés padon rúddal', 'hát', FALSE),
    ('Egykezes evezés kézisúlyzóval', 'hát', FALSE),
    ('Húzódzkodás', 'hát', TRUE),
    ('Fordított evezés testsúllyal', 'hát', TRUE),

    -- váll
    ('Ferde padon csiga vállnyomás', 'váll', FALSE),
    ('Hátsó delt csiga ferde ülés', 'váll', FALSE),
    ('Vállból nyomás rúddal', 'váll', FALSE),
    ('Oldalemelés kézisúlyzóval', 'váll', FALSE),
    ('Kézenállás tartás', 'váll', TRUE),
    ('Pike push-up', 'váll', TRUE),

    -- bicepsz
    ('Csiga bicepsz hajlítás', 'bicepsz', FALSE),
    ('Gépi bicepsz hajlítás', 'bicepsz', FALSE),
    ('Rúddal bicepsz hajlítás', 'bicepsz', FALSE),
    ('Kalapács bicepsz kézisúlyzóval', 'bicepsz', FALSE),
    ('Húzódzkodás szűk fogással', 'bicepsz', TRUE),
    ('Bicepsz tartás testsúllyal', 'bicepsz', TRUE),

    -- tricepsz
    ('Csiga tricepsz letolás', 'tricepsz', FALSE),
    ('Csiga tricepsz nyújtás fej felett', 'tricepsz', FALSE),
    ('Fekvenyomás szűk fogással', 'tricepsz', FALSE),
    ('Tricepsz kickback kézisúlyzóval', 'tricepsz', FALSE),
    ('Tolódzkodás', 'tricepsz', TRUE),
    ('Szűk fekvőtámasz', 'tricepsz', TRUE),

    -- alkar
    ('Csukló hajlítás csigán', 'alkar', FALSE),
    ('Fordított csukló hajlítás csigán', 'alkar', FALSE),
    ('Rúddal csukló hajlítás', 'alkar', FALSE),
    ('Kézisúlyzó tartás', 'alkar', FALSE),
    ('Tárcsa csípés', 'alkar', FALSE),
    ('Rúdon függés', 'alkar', TRUE),

    -- has
    ('Csiga hasprés', 'has', FALSE),
    ('Csiga lábemelés', 'has', FALSE),
    ('Súlyozott felülés', 'has', FALSE),
    ('Oldalirányú csavarás kézisúlyzóval', 'has', FALSE),
    ('Plank', 'has', TRUE),
    ('Mountain climbers', 'has', TRUE),

    -- ferde has
    ('Csiga oldalsó csavarás', 'ferde_has', FALSE),
    ('Pallof press', 'ferde_has', FALSE),
    ('Orosz csavar kézisúlyzóval', 'ferde_has', FALSE),
    ('Oldalsó plank súlyzóval', 'ferde_has', FALSE),
    ('Oldalsó plank', 'ferde_has', TRUE),
    ('Ferde has V-emelés', 'ferde_has', TRUE),

    -- alsó hát
    ('Hátfeszítés csigán', 'alsó_hát', FALSE),
    ('Ülő csiga hátfeszítés', 'alsó_hát', FALSE),
    ('Román felhúzás rúddal', 'alsó_hát', FALSE),
    ('Good morning kézisúlyzóval', 'alsó_hát', FALSE),
    ('Superman tartás', 'alsó_hát', TRUE),
    ('Bird-Dog', 'alsó_hát', TRUE),

    -- comb elülső
    ('Lábtolás csigán', 'comb_első', FALSE),
    ('Lábfeszítés csigán', 'comb_első', FALSE),
    ('Rúddal guggolás', 'comb_első', FALSE),
    ('Sétáló kitörés kézisúlyzóval', 'comb_első', FALSE),
    ('Testtömeg guggolás', 'comb_első', TRUE),
    ('Falnál ülés', 'comb_első', TRUE),

    -- comb hátsó
    ('Lábhajlítás csigán ülve', 'comb_hátsó', FALSE),
    ('Lábhajlítás csigán fekve', 'comb_hátsó', FALSE),
    ('Egylábas román felhúzás kézisúlyzóval', 'comb_hátsó', FALSE),
    ('Lábhajlítás kézisúlyzóval', 'comb_hátsó', FALSE),
    ('Nordic hamstring curl', 'comb_hátsó', TRUE),
    ('Egylábas farizom emelés testsúllyal', 'comb_hátsó', TRUE),

    -- farizom
    ('Csípőnyomás csigán', 'farizom', FALSE),
    ('Kickback csigán', 'farizom', FALSE),
    ('Hip thrust rúddal', 'farizom', FALSE),
    ('Lépés padra kézisúlyzóval', 'farizom', FALSE),
    ('Glute bridge testsúllyal', 'farizom', TRUE),
    ('Donkey kicks testsúllyal', 'farizom', TRUE),

    -- vádli
    ('Ülő vádli csigán', 'vádli', FALSE),
    ('Álló vádli csigán', 'vádli', FALSE),
    ('Álló rúddal vádli emelés', 'vádli', FALSE),
    ('Kézisúlyzóval vádli emelés', 'vádli', FALSE),
    ('Testtömeg vádli emelés', 'vádli', TRUE),
    ('Ugrókötél vádli edzés', 'vádli', TRUE),

    -- teljes test
    ('Felhúzás rúddal', 'teljes_test'),
    ('Guggolás rúddal', 'teljes_test'),
    ('Clean & Press rúddal', 'teljes_test'),
    ('Burpee testsúllyal', 'teljes_test'),
    ('Kettlebell swing', 'teljes_test'),
    ('Farmer walk kézisúlyzóval', 'teljes_test');


-- insert allergens
INSERT INTO allergens (name) VALUES
    ('tej'),
    ('tojas'),
    ('gluten'),
    ('mogyoro'),
    ('diofelek'),
    ('magvak'),
    ('hal');

-- FOODS tesztadatok
INSERT INTO foods (
    name, description, image_url, category,
    created_by, is_approved,
    calories_kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, salt_g,
    serving_size, serving_unit,
    goal_tag, diet_tag, difficulty, prep_time_min,
    high_protein, low_carb, bulk_friendly, cut_friendly
) VALUES
('Zabkása gyümölccsel', 'Egyszerű zabkása friss gyümölcsökkel', NULL, 'reggeli',
NULL, TRUE,
350, 12, 55, 8, 6, 10, 0.5,
100, 'g',
'mind', 'vegetarianus', 'konnyu', 10,
FALSE, FALSE, TRUE, TRUE),

('Rántotta tojásból', 'Klasszikus rántotta', NULL, 'reggeli',
NULL, TRUE,
250, 18, 2, 20, 0, 1, 0.8,
2, 'db',
'tomegnoveles', 'mindenevo', 'konnyu', 5,
TRUE, TRUE, TRUE, FALSE),

('Csirkemell rizzsel', 'Grillezett csirkemell főtt rizzsel', NULL, 'ebed',
NULL, TRUE,
600, 45, 70, 10, 2, 1, 1.2,
1, 'adag',
'tomegnoveles', 'mindenevo', 'kozepes', 30,
TRUE, FALSE, TRUE, FALSE),

('Tonhalsaláta', 'Friss saláta tonhallal', NULL, 'ebed',
NULL, TRUE,
300, 30, 10, 15, 4, 3, 1.0,
1, 'tal',
'szalkasitas', 'mindenevo', 'konnyu', 15,
TRUE, TRUE, FALSE, TRUE),

('Marhapörkölt', 'Hagyományos magyar marhapörkölt', NULL, 'vacsora',
NULL, TRUE,
700, 50, 20, 40, 2, 2, 1.5,
1, 'adag',
'tomegnoveles', 'mindenevo', 'nehez', 90,
TRUE, TRUE, TRUE, FALSE),

('Grillezett lazac', 'Egészséges lazac zöldségekkel', NULL, 'vacsora',
NULL, TRUE,
500, 40, 5, 35, 3, 1, 1.0,
1, 'adag',
'szalkasitas', 'mindenevo', 'kozepes', 25,
TRUE, TRUE, FALSE, TRUE),

('Protein shake', 'Fehérjeturmix tejjel', NULL, 'ital',
NULL, TRUE,
200, 25, 10, 5, 1, 5, 0.3,
300, 'ml',
'tomegnoveles', 'mindenevo', 'konnyu', 5,
TRUE, FALSE, TRUE, FALSE),

('Banán', 'Friss banán', NULL, 'snack',
NULL, TRUE,
90, 1, 23, 0, 2, 12, 0,
1, 'db',
'mind', 'vegan', 'konnyu', 0,
FALSE, FALSE, FALSE, TRUE),

('Mandula', 'Pörkölt mandula', NULL, 'snack',
NULL, TRUE,
600, 20, 20, 50, 10, 5, 0,
50, 'g',
'tomegnoveles', 'vegan', 'konnyu', 0,
TRUE, TRUE, TRUE, FALSE),

('Palacsinta', 'Házi palacsinta', NULL, 'desszert',
NULL, TRUE,
400, 10, 60, 15, 2, 20, 0.5,
2, 'db',
'mind', 'vegetarianus', 'kozepes', 20,
FALSE, FALSE, TRUE, FALSE),

('Túrós desszert', 'Fehérjedús túrós édesség', NULL, 'desszert',
NULL, TRUE,
300, 25, 20, 10, 1, 10, 0.5,
1, 'adag',
'tomegnoveles', 'vegetarianus', 'konnyu', 10,
TRUE, FALSE, TRUE, FALSE),

('Zöldségleves', 'Könnyű zöldségleves', NULL, 'ebed',
NULL, TRUE,
150, 5, 20, 3, 5, 5, 1.0,
1, 'tal',
'szalkasitas', 'vegan', 'konnyu', 30,
FALSE, TRUE, FALSE, TRUE),

('Avokádó toast', 'Pirítós avokádóval', NULL, 'reggeli',
NULL, TRUE,
350, 8, 30, 20, 5, 2, 0.8,
1, 'szelet',
'mind', 'vegan', 'konnyu', 10,
FALSE, FALSE, TRUE, TRUE),

('Tofu stir fry', 'Tofus zöldséges étel', NULL, 'vacsora',
NULL, TRUE,
400, 20, 30, 20, 4, 5, 1.2,
1, 'adag',
'mind', 'vegan', 'kozepes', 25,
TRUE, FALSE, TRUE, TRUE),

('Narancslé', 'Frissen facsart narancslé', NULL, 'ital',
NULL, TRUE,
120, 2, 25, 0, 1, 20, 0,
250, 'ml',
'mind', 'vegan', 'konnyu', 5,
FALSE, FALSE, FALSE, TRUE);

INSERT INTO food_allergens (food_id, allergen_id) VALUES
(1, 3),
(2, 2),
(4, 7),
(6, 7),
(7, 1),
(9, 5),
(10, 3),
(10, 2),
(10, 1),
(11, 1),
(13, 3);

UPDATE foods SET description =
'Összetevők:\n\t- 50g zabpehely\n\t- 200ml tej\n\t- 1db banán\n\t- 50g bogyós gyümölcs'
WHERE name = 'Zabkása gyümölccsel';

UPDATE foods SET description =
'Összetevők:\n\t- 2db tojás\n\t- 5g olaj\n\t- só ízlés szerint'
WHERE name = 'Rántotta tojásból';

UPDATE foods SET description =
'Összetevők:\n\t- 150g csirkemell\n\t- 100g rizs\n\t- 5g olaj\n\t- fűszerek'
WHERE name = 'Csirkemell rizzsel';

UPDATE foods SET description =
'Összetevők:\n\t- 100g tonhal\n\t- 50g saláta mix\n\t- 30g paradicsom\n\t- 10g olívaolaj'
WHERE name = 'Tonhalsaláta';

UPDATE foods SET description =
'Összetevők:\n\t- 200g marhahús\n\t- 100g hagyma\n\t- 10g paprika\n\t- 5g olaj'
WHERE name = 'Marhapörkölt';

UPDATE foods SET description =
'Összetevők:\n\t- 150g lazac\n\t- 100g zöldség mix\n\t- 10g olívaolaj'
WHERE name = 'Grillezett lazac';

UPDATE foods SET description =
'Összetevők:\n\t- 30g protein por\n\t- 300ml tej\n\t- 1db banán'
WHERE name = 'Protein shake';

UPDATE foods SET description =
'Összetevők:\n\t- 1db banán'
WHERE name = 'Banán';

UPDATE foods SET description =
'Összetevők:\n\t- 50g mandula'
WHERE name = 'Mandula';

UPDATE foods SET description =
'Összetevők:\n\t- 100g liszt\n\t- 2db tojás\n\t- 200ml tej\n\t- 10g cukor'
WHERE name = 'Palacsinta';

UPDATE foods SET description =
'Összetevők:\n\t- 150g túró\n\t- 50g joghurt\n\t- 10g méz'
WHERE name = 'Túrós desszert';

UPDATE foods SET description =
'Összetevők:\n\t- 50g sárgarépa\n\t- 50g krumpli\n\t- 30g zeller\n\t- 1L víz'
WHERE name = 'Zöldségleves';

UPDATE foods SET description =
'Összetevők:\n\t- 1 szelet kenyér\n\t- 50g avokádó\n\t- só, bors'
WHERE name = 'Avokádó toast';

UPDATE foods SET description =
'Összetevők:\n\t- 100g tofu\n\t- 100g zöldség mix\n\t- 10g szójaszósz'
WHERE name = 'Tofu stir fry';

UPDATE foods SET description =
'Összetevők:\n\t- 3db narancs (kb. 250ml lé)'
WHERE name = 'Narancslé';

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