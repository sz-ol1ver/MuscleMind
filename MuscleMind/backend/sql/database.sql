CREATE DATABASE musclemind
COLLATE utf8_hungarian_ci
DEFAULT CHARACTER set utf8;
USE musclemind;

CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,

    action VARCHAR(100) NOT NULL,
    description TEXT,

    ip_address VARCHAR(45) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    admin BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,

    weight DECIMAL(5,1) NULL,
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

    FOREIGN KEY (id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
