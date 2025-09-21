/* Create database */
CREATE DATABASE IF NOT EXISTS slsldb;
USE slsldb;

/* Drop tables if they exist */
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS users;

/* Create tables */
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cards (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    video_url VARCHAR(255) NOT NULL,
    option_1 VARCHAR(255) NOT NULL,
    option_2 VARCHAR(255) NOT NULL,
    option_3 VARCHAR(255) NOT NULL,
    option_4 VARCHAR(255) NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    chapter VARCHAR(100) NOT NULL,
    difficulty FLOAT DEFAULT 0.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chosen_answer VARCHAR(255) NOT NULL,
    was_correct BOOLEAN NOT NULL,
    time_since_last FLOAT,
    times_reviewed INT,
    last_correct BOOLEAN,
    response_time FLOAT,
    confidence INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (card_id) REFERENCES cards(card_id)
);

CREATE TABLE schedules (
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    next_due_time TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, card_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (card_id) REFERENCES cards(card_id)
);