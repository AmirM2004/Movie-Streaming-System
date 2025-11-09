DROP TABLE IF EXISTS users, movies, genres, reviews, watch_history, subscriptions, wallet_transactions CASCADE;


CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price FLOAT NOT NULL
);

CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL
);


CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    release_date DATE NOT NULL,
    description TEXT,
    profile VARCHAR NOT NULL ,
    genre_id INT REFERENCES genres(id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    admin BOOLEAN DEFAULT false,

    wallet_balance FLOAT DEFAULT 0,
    subscription_id INT REFERENCES subscriptions(id) DEFAULT NULL
);


CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    movie_id INT REFERENCES movies(id),
    rating FLOAT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE watch_history (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    movie_id INT REFERENCES movies(id),
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallet_transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    transaction_type VARCHAR NOT NULL,
    amount FLOAT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Users table indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_id ON users(subscription_id);

-- Movies table indexes
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_release_date ON movies(release_date);
CREATE INDEX idx_movies_genre_id ON movies(genre_id);

-- Reviews table indexes
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Watch history indexes
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_movie_id ON watch_history(movie_id);
CREATE INDEX idx_watch_history_watched_at ON watch_history(watched_at);

-- Subscriptions table indexes
CREATE INDEX idx_subscriptions_plan_name ON subscriptions(plan_name);
CREATE INDEX idx_subscriptions_dates ON subscriptions(start_date, end_date);

-- Wallet transactions indexes
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_transaction_date ON wallet_transactions(transaction_date);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);