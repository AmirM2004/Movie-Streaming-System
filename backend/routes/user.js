const express = require("express");
const router = express.Router();
const { DataQueries  , Genres , Movies} = require("../database/models");


// دریافت لیست ژانرها 
router.get("/genres", async (req, res) => {
    try {
        const genres = await Genres.getAllGenres() ;
        res.json(genres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// دریافت لیست فیلم‌ها با فیلتر
router.get("/movies", async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            genre: req.query.genre,
            sortBy: req.query.sortBy
        };
        const movies = await DataQueries.getFilteredMovies(filters);
        res.json(movies);
        // console.log(movies)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// دریافت جزئیات یک فیلم
router.get("/movies/:movieId", async (req, res) => {
    try {
        const movie = await DataQueries.getMovieDetails(req.params.movieId);
        if (!movie) {
            return res.status(404).json({ message: "فیلم یافت نشد" });
        }
        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// دریافت نظرات یک فیلم
router.get("/movies/:movieId/reviews", async (req, res) => {
    try {
        const reviews = await DataQueries.getMovieReviews(req.params.movieId);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ثبت نظر جدید
router.post("/movies/:movieId/reviews", async (req, res) => {
    try {
        const { userId, rating, comment } = req.body;
        const review = await DataQueries.addReview(userId, req.params.movieId, rating, comment);
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ثبت بازدید فیلم
router.post("/movies/:movieId/view", async (req, res) => {
    try {
        const { userId } = req.body;
        const view = await DataQueries.addView(userId, req.params.movieId);
        res.status(201).json(view);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// برسی ویو فیلم برای ثبت ویو جدید
router.post('/movies/:movieId/check-view', async (req, res) => {
    const { movieId } = req.params; 
    const { userId } = req.body; 

    if (!userId || !movieId) {
        return res.status(400).json({ error: 'User ID and Movie ID are required' });
    }

    try {
        const hasViewed = await DataQueries.checkMovieView(userId, movieId);
        return res.status(200).json({ hasViewed });
    } catch (error) {
        console.error('Error checking view status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// دریافت اطلاعات کاربر
router.get("/:userId", async (req, res) => {
    try {
        const user = await DataQueries.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "کاربر یافت نشد" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message , mee : 1});
    }
});

// دریافت تاریخچه تماشا
router.get("/:userId/watch-history", async (req, res) => {
    try {
        const history = await DataQueries.getWatchHistory(req.params.userId);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// دریافت تراکنش‌ها
router.get("/:userId/transactions", async (req, res) => {
    try {
        const transactions = await DataQueries.getUserTransactions(req.params.userId);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// شارژ کیف پول
router.post("/:userId/charge", async (req, res) => {
    try {
        const { amount } = req.body;
        const result = await DataQueries.chargeWallet(req.params.userId, amount);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// دریافت اطلاعات اشتراک
router.get("/:userId/subscription", async (req, res) => {
    try {
        const subscription = await DataQueries.getUserSubscription(req.params.userId);
        if (subscription) res.json(subscription) 
        else res.json(null)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// خرید اشتراک
router.post("/:userId/subscription", async (req, res) => {
    // console.log(1)
    try {
        const { plan } = req.body;
        const subscription = await DataQueries.purchaseSubscription(req.params.userId, plan);
        // console.log(subscription)
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;