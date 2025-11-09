const express = require("express");
const router = express.Router();
const { DataQueries, User, Movies, Genres } = require("../database/models");
const multer = require('multer');
const path = require('path');

// برای خوندن عکس ها از پوشه پابلیک

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images/movies'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
        cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'), false);
    }
    cb(null, true);
};
const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// اضافه کردن فیلم
router.post('/addmovie', upload.single('image'), async (req, res) => {
    try {
        const { title, genre, release_date } = req.body;
        
        if (!title || !genre || !release_date || !req.file) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        await Movies.addMovie(title, genre, release_date, req.file.filename);
        res.status(201).json({ message: 'Movie added successfully' });
    } catch (error) {
        console.error('Error adding movie:', error);
        res.status(500).json({ error: 'Failed to add movie' });
    }
});

// حذف فیلم
router.post('/delete_movie', async (req, res) => {
    const { movieId } = req.body;
    
    if (!movieId) {
        return res.status(400).json({ error: 'Movie ID is required' });
    }
    
    try {
        await Movies.deleteMovie(movieId);
        res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ error: 'Failed to delete movie' });
    }
});

// دریافت فیلم ها
router.get("/getmovie", async (req, res) => {
    try {
        const movies = await DataQueries.Get_movies();
        res.status(200).json(movies.rows);
        // console.log(movies.rows)
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

// دریافت کاربران
router.get("/getusers", async (req, res) => {
    try {
        const users = await DataQueries.Get_users();
        res.status(200).json(users.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// حذف کاربر
router.post('/delete_user', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        await User.deleteUserById(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// دریافت ژانر ها
router.get("/getgenres", async (req, res) => {
    try {
        const genres = await DataQueries.Get_genres();
        res.status(200).json(genres.rows);
    } catch (error) {
        console.error("Error fetching genres:", error);
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
});

// اضافه کردن ژانر
router.post('/add_genres', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Valid genre name is required' });
        }

        const newGenre = await Genres.addGenre(name);
        res.status(201).json({
            message: 'Genre added successfully',
            genre: newGenre
        });
    } catch (error) {
        console.error('Error adding genre:', error);
        res.status(500).json({ error: 'Failed to add genre' });
    }
});

// حذف ژانر
router.post('/delete_genre', async (req, res) => {
    const { genreId } = req.body;
    
    if (!genreId) {
        return res.status(400).json({ error: 'Genre ID is required' });
    }
    
    try {
        await Genres.deleteGenre(genreId);
        res.status(200).json({ message: 'Genre deleted successfully' });
    } catch (error) {
        console.error('Error deleting genre:', error);
        res.status(500).json({ error: 'Failed to delete genre' });
    }
});

// دریافت تراکنش های همه کاربران
router.get('/loadTransactions', async (req, res) => {
    try {
        const result = await DataQueries.loadTransactions();
        res.status(200).json(result.rows);
        // console.log(result.rows)
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

module.exports = router;