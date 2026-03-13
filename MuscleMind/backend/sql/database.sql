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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_profiles_users
        FOREIGN KEY (id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_weights (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    weight DECIMAL(5,1) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_weights_users
        FOREIGN KEY (user_id)
        REFERENCES user_profiles(id)
        ON DELETE CASCADE
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
        'comb_elso',
        'comb_hatso',
        'farizom',
        'vádli',
        'teljes_test'
    ) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_plans(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    days_count TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workout_plans_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workout_days(
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    day_number TINYINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    image_name VARCHAR(100) NULL,

    CONSTRAINT fk_workout_days_workout_plans
        FOREIGN KEY (plan_id)
        REFERENCES workout_plans(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_workout_days_plan_day
        UNIQUE (plan_id, day_number)
);

CREATE TABLE IF NOT EXISTS day_exercises(
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_id INT NOT NULL,
    exercise_id INT NOT NULL,
    exercise_order INT NOT NULL,

    CONSTRAINT fk_day_exercises_workout_days
        FOREIGN KEY (day_id)
        REFERENCES workout_days(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_day_exercises_exercise
        FOREIGN KEY (exercise_id)
        REFERENCES exercises(id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_day_exercises_unique_per_day
        UNIQUE (day_id, exercise_id),
    CONSTRAINT uq_day_exercises_order
        UNIQUE (day_id, exercise_order)
);

CREATE TABLE IF NOT EXISTS workout_calendar_logs(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    workout_plan_id INT NOT NULL,
    workout_day_id INT NOT NULL,
    workout_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_workout_calendar_logs_users
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
        UNIQUE (user_id, workout_date)
);

CREATE TABLE IF NOT EXISTS workout_calendar_exercises(
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_calendar_log_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets_done INT NOT NULL,
    reps_done INT NOT NULL,
    weight_done DECIMAL(6,2) NOT NULL,

    CONSTRAINT fk_workout_calendar_exercises_log
        FOREIGN KEY (workout_calendar_log_id)
        REFERENCES workout_calendar_logs(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_workout_calendar_exercises_exercises
        FOREIGN KEY (exercise_id)
        REFERENCES exercises(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_workout_calendar_exercise_unique
        UNIQUE (workout_calendar_log_id, exercise_id)
);