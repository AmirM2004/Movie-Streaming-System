const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',       
  host: 'localhost',      
  database: 'movie',
  password: 'amir123',
  port: 5432,               
});


const bcrypt = require('bcrypt');


class DataQueries {

    static async findByUsername(username) {
        const query = {
            text: 'SELECT * FROM users WHERE username = $1',
            values: [username],
        };
        const result = await pool.query(query);
        return result.rows[0];
    }

    static async findById(userId) {
        const query = {
            text: 'SELECT * FROM users WHERE id = $1',
            values: [userId],
        };
        const result = await pool.query(query);
        return result.rows[0];
    }

    static async validatePassword(inputPassword, hashedPassword) {
        return bcrypt.compare(inputPassword, hashedPassword);
    }

    static async Get_users() {
        const query = `
            SELECT 
                u.id, u.username, u.email, u.wallet_balance,
                COUNT(DISTINCT wh.id) as total_watches,
                COUNT(DISTINCT r.id) as total_comments,
                COALESCE(s.end_date::text, 'No Subscription') as subscription_end_date
            FROM users u
            LEFT JOIN watch_history wh ON u.id = wh.user_id
            LEFT JOIN reviews r ON u.id = r.user_id
            LEFT JOIN subscriptions s ON u.subscription_id = s.id
            WHERE u.admin = false
            GROUP BY u.id, u.username, u.email, u.wallet_balance, s.end_date
        `;
        return await pool.query(query);
    }

    static async Get_movies() {
        const query = `
            SELECT 
                m.id, m.title, m.release_date, m.description, m.profile ,
                g.name as genre_name,
                COUNT(DISTINCT wh.id) as view_count,
                COUNT(DISTINCT r.id) as comment_count,
                ROUND(AVG(r.rating)::numeric, 1) as rating
            FROM movies m
            LEFT JOIN genres g ON m.genre_id = g.id
            LEFT JOIN watch_history wh ON m.id = wh.movie_id
            LEFT JOIN reviews r ON m.id = r.movie_id
            GROUP BY m.id, m.title, m.release_date, m.description, g.name
        `;
        return await pool.query(query);
    }

    static async Get_genres() {
        const query = `
            SELECT 
                g.id, g.name,
                COUNT(DISTINCT wh.id) as view_count,
                COUNT(DISTINCT r.id) as comment_count,
                ROUND(AVG(r.rating)::numeric, 1) as average_rating
            FROM genres g
            LEFT JOIN movies m ON g.id = m.genre_id
            LEFT JOIN watch_history wh ON m.id = wh.movie_id
            LEFT JOIN reviews r ON m.id = r.movie_id
            GROUP BY g.id, g.name
        `;
        return await pool.query(query);
    }

    static async loadTransactions() {
        const query = `
            SELECT 
                wt.id,
                u.username,
                wt.transaction_type,
                wt.amount,
                wt.transaction_date
            FROM wallet_transactions wt
            LEFT JOIN users u ON wt.user_id = u.id
            ORDER BY wt.transaction_date DESC;
        `;
        return await pool.query(query);
    }

    // دریافت اطلاعات فیلم‌ها با فیلتر
    static async getFilteredMovies(filters = {}) {
        let query = `
            SELECT 
                m.id, m.title, m.release_date, m.description, m.profile,
                g.name as genre_name,
                COUNT(DISTINCT wh.id) as views,
                COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as rating
            FROM movies m
            LEFT JOIN genres g ON m.genre_id = g.id
            LEFT JOIN watch_history wh ON m.id = wh.movie_id
            LEFT JOIN reviews r ON m.id = r.movie_id
        `;

        const values = [];
        const conditions = [];

        if (filters.search) {
            values.push(`%${filters.search}%`);
            conditions.push(`m.title ILIKE $${values.length}`);
        }

        if (filters.genre) {
            values.push(filters.genre);
            conditions.push(`g.id = $${values.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY m.id, m.title, m.release_date, m.description, m.profile, g.name';

        if (filters.sortBy) {
            query += ` ORDER BY ${filters.sortBy === 'rating' ? 'rating' : 'views'} DESC`;
        }

        const result = await pool.query(query, values);
        return result.rows;
    }

    // دریافت جزئیات یک فیلم
    static async getMovieDetails(movieId) {
        const query = `
            SELECT 
                m.id, m.title, m.release_date, m.description, m.profile,
                g.name as genre_name,
                COUNT(DISTINCT wh.id) as views,
                COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as rating
            FROM movies m
            LEFT JOIN genres g ON m.genre_id = g.id
            LEFT JOIN watch_history wh ON m.id = wh.movie_id
            LEFT JOIN reviews r ON m.id = r.movie_id
            WHERE m.id = $1
            GROUP BY m.id, m.title, m.release_date, m.description, m.profile, g.name
        `;
        const result = await pool.query(query, [movieId]);
        return result.rows[0];
    }

    // دریافت نظرات یک فیلم
    static async getMovieReviews(movieId) {
        const query = `
            SELECT 
                r.id, r.rating, r.comment, r.created_at,
                u.username
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.movie_id = $1
            ORDER BY r.created_at DESC
        `;
        const result = await pool.query(query, [movieId]);
        return result.rows;
    }

    // ثبت نظر جدید
    static async addReview(userId, movieId, rating, comment) {
        const query = `
            INSERT INTO reviews (user_id, movie_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        const result = await pool.query(query, [userId, movieId, rating, comment]);
        return result.rows[0];
    }

    // ثبت بازدید فیلم
    static async addView(userId, movieId) {
        const query = `
            INSERT INTO watch_history (user_id, movie_id)
            VALUES ($1, $2)
            RETURNING id
        `;
        const result = await pool.query(query, [userId, movieId]);
        return result.rows[0];
    }

    // دریافت تاریخچه تماشا
    static async getWatchHistory(userId) {
        const query = `
            SELECT 
                wh.id, wh.watched_at,
                m.id as movie_id, m.title as movie_title, m.profile as movie_profile
            FROM watch_history wh
            JOIN movies m ON wh.movie_id = m.id
            WHERE wh.user_id = $1
            ORDER BY wh.watched_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    // دریافت تراکنش‌های کاربر
    static async getUserTransactions(userId) {
        const query = `
            SELECT id, transaction_type, amount, transaction_date
            FROM wallet_transactions
            WHERE user_id = $1
            ORDER BY transaction_date DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    // شارژ کیف پول
    static async chargeWallet(userId, amount) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // ثبت تراکنش
            const transactionQuery = `
                INSERT INTO wallet_transactions (user_id, transaction_type, amount)
                VALUES ($1, 'deposit', $2)
            `;
            await client.query(transactionQuery, [userId, amount]);

            // به‌روزرسانی موجودی کیف پول
            const updateQuery = `
                UPDATE users 
                SET wallet_balance = wallet_balance + $2
                WHERE id = $1
                RETURNING wallet_balance
            `;
            const result = await client.query(updateQuery, [userId, amount]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // دریافت اطلاعات اشتراک کاربر
    static async getUserSubscription(userId) {
        const query = `
            SELECT s.* 
            FROM subscriptions s
            JOIN users u ON u.subscription_id = s.id
            WHERE u.id = $1 AND s.end_date >= CURRENT_DATE
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    // خرید اشتراک
    static async purchaseSubscription(userId, plan) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // محاسبه قیمت و مدت اشتراک
            let price, months;
            switch (plan) {
                case 'monthly':
                    price = 10;
                    months = 1;
                    break;
                case 'quarterly':
                    price = 25;
                    months = 3;
                    break;
                case 'yearly':
                    price = 90;
                    months = 12;
                    break;
                default:
                    throw new Error('Invalid subscription plan');
            }

            // بررسی موجودی کافی
            const userQuery = 'SELECT wallet_balance FROM users WHERE id = $1';
            const userResult = await client.query(userQuery, [userId]);
            if (userResult.rows[0].wallet_balance < price) {
                throw new Error('Insufficient balance');
            }

            // ایجاد اشتراک جدید
            const subscriptionQuery = `
                INSERT INTO subscriptions (plan_name, start_date, end_date, price)
                VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month' * $2, $3)
                RETURNING id
            `;
            const subscriptionResult = await client.query(subscriptionQuery, [plan, months, price]);

            // به‌روزرسانی کاربر
            const updateUserQuery = `
                UPDATE users 
                SET subscription_id = $2, wallet_balance = wallet_balance - $3
                WHERE id = $1
            `;
            await client.query(updateUserQuery, [userId, subscriptionResult.rows[0].id, price]);

            // ثبت تراکنش
            const transactionQuery = `
                INSERT INTO wallet_transactions (user_id, transaction_type, amount)
                VALUES ($1, 'subscription', $2)
            `;
            await client.query(transactionQuery, [userId, -price]);

            await client.query('COMMIT');
            return subscriptionResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // برسی ویوی یک فیلم توسط کاربر
    static async checkMovieView(userId, movieId) {
        const query = `
            SELECT COUNT(*) AS view_count 
            FROM watch_history 
            WHERE user_id = $1 AND movie_id = $2
        `;
        const result = await pool.query(query, [userId, movieId]);
        return result.rows[0].view_count > 0; // بازگشت true یا false
    }
}

class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    async save() {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        const query = {
            text: 'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING id, username, email',
            values: [this.username, this.email, hashedPassword]
        };
        
        try {
            const { rows: [user] } = await pool.query(query);
            return user;
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Username or email already exists');
            }
            throw new Error('Error creating user');
        }
    }

    static async deleteUserById(userId) {
        const query = {
            text: 'DELETE FROM users WHERE id = $1 RETURNING id',
            values: [userId]
        };
        
        const { rows: [user] } = await pool.query(query);
        return user;
    }
}

class Movies {
    static async addMovie(title, genreId, releaseDate, filename) {
        const query = `
            INSERT INTO movies (title, genre_id, release_date, profile) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id
        `;
        const result = await pool.query(query, [title, genreId, releaseDate, filename]);
        return result.rows[0];
    }

    static async deleteMovie(movieId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Delete related records first
            await client.query('DELETE FROM watch_history WHERE movie_id = $1', [movieId]);
            await client.query('DELETE FROM reviews WHERE movie_id = $1', [movieId]);
            
            // Finally delete the movie
            await client.query('DELETE FROM movies WHERE id = $1', [movieId]);
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getMovieById(movieId) {
        const query = `
            SELECT 
                m.*, g.name as genre_name,
                COUNT(DISTINCT wh.id) as view_count,
                ROUND(AVG(r.rating)::numeric, 1) as average_rating
            FROM movies m
            LEFT JOIN genres g ON m.genre_id = g.id
            LEFT JOIN watch_history wh ON m.id = wh.movie_id
            LEFT JOIN reviews r ON m.id = r.movie_id
            WHERE m.id = $1
            GROUP BY m.id, m.title, m.release_date, m.description, g.name
        `;
        const result = await pool.query(query, [movieId]);
        return result.rows[0];
    }
}

class Genres {
    static async addGenre(name) {
        const query = `
            INSERT INTO genres (name) 
            VALUES ($1) 
            RETURNING id, name
        `;
        const result = await pool.query(query, [name]);
        return result.rows[0];
    }

    static async deleteGenre(genreId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Update movies to remove genre reference
            await client.query('UPDATE movies SET genre_id = NULL WHERE genre_id = $1', [genreId]);
            
            // Delete the genre
            await client.query('DELETE FROM genres WHERE id = $1', [genreId]);
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getAllGenres() {
        const query = 'SELECT * FROM genres ORDER BY name';
        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = {
    DataQueries,
    User,
    Movies,
    Genres
};