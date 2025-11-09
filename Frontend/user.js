// متغیرهای سراسری
let currentUser = null;
let currentMovieId = null;

// اجرای اولیه
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadGenres();
    loadMovies();
    updateUserInfo();
});

// توابع مربوط به احراز هویت
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    currentUser = user;
    document.getElementById('welcomeUser').textContent = `خوش آمدید ${user.username}`;
}

// تابع خروج
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// توابع مربوط به بروزرسانی اطلاعات کاربر 👍🏻
async function updateUserInfo() {
    try {
        const response = await fetch(`http://localhost:3000/api/user/${currentUser.id}`);
        const userData = await response.json();
        document.getElementById('walletBalance').textContent = `موجودی: $${userData.wallet_balance}`;
        currentUser = { ...currentUser, ...userData };
    } catch (error) {
        console.error('خطا در دریافت اطلاعات کاربر:', error);
    }
}

// توابع مربوط به فیلم‌ها 👍🏻
async function loadGenres() {
    try {
        const response = await fetch('http://localhost:3000/api/user/genres');
        const genres = await response.json();
        // console.log(genres)
        const genreSelect = document.getElementById('genreFilter');
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('خطا در دریافت ژانرها:', error);
    }
}

// تابع نمایش فیلم ها
async function loadMovies(filters = {}) {
    try {
        let url = 'http://localhost:3000/api/user/movies';
        const params = new URLSearchParams(filters);
        if (Object.keys(filters).length > 0) {
            url += `?${params}`;
        }
        
        const response = await fetch(url);
        // console.log(response)
        const movies = await response.json();
        
        const moviesList = document.getElementById('moviesList');
        moviesList.innerHTML = '';
        
        if (movies.length === 0) {
            moviesList.innerHTML = '<div class="col-span-full text-center text-gray-500 text-lg">فیلمی یافت نشد</div>';
            return;
        }
        
        movies.forEach(movie => {
            // console.log(movie)
            const movieCard = createMovieCard(movie);
            moviesList.appendChild(movieCard);
        });
    } catch (error) {
        console.error('خطا در دریافت فیلم‌ها:', error);
    }
}

// ساخت هر آبجکت فیلم
function createMovieCard(movie) {
    const div = document.createElement('div');
    div.className = 'movie-card bg-white rounded-lg shadow overflow-hidden';
    div.innerHTML = `
        <div class="aspect-video w-full">
            <img src="http://localhost:3000/public/images/movies/${movie.profile}" 
                 alt="${movie.title}" 
                 class="w-full h-full object-cover">
        </div>
        <div class="p-4">
            <h3 class="text-xl font-bold mb-2 h-14 overflow-hidden">${movie.title}</h3>
            <div class="flex justify-between items-center mb-2">
                <span class="text-yellow-500">⭐ ${movie.rating}</span>
                <span class="text-gray-600">👁 ${movie.views}</span>
            </div>
            <span class="text-sm text-gray-500">${movie.genre_name}</span>
            <button onclick="showMovieDetails(${movie.id})" 
                    class="mt-2 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                مشاهده فیلم
            </button>
        </div>
    `;
    return div;
}

// نمایش جزئیات فیلم ها در مودال جدید
async function showMovieDetails(movieId) {
    try {
        // چک کردن اشتراک
        const subscriptionResponse = await fetch(`http://localhost:3000/api/user/${currentUser.id}/subscription`);
        const subscription = await subscriptionResponse.json();
        
        if (!subscription) {
            alert('برای تماشای فیلم نیاز به اشتراک فعال دارید');
            showSubscription();
            return;
        }

        currentMovieId = movieId;
        const response = await fetch(`http://localhost:3000/api/user/movies/${movieId}`);
        const movie = await response.json();

        // چک کردن ویوی قبلی
        const viewCheckResponse = await fetch(`http://localhost:3000/api/user/movies/${movieId}/check-view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: currentUser.id })
        });
        
        const viewCheck = await viewCheckResponse.json();
        
        // اگر قبلاً ویو نداشته، ثبت ویو جدید
        if (!viewCheck.hasViewed) {
            await fetch(`http://localhost:3000/api/user/movies/${movieId}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: currentUser.id })
            });
        }
        
        const movieDetails = document.getElementById('movieDetails');
        movieDetails.innerHTML = `

            <div class="aspect-video w-full">
                <img src="http://localhost:3000/public/images/movies/${movie.profile}" 
                    alt="${movie.title}" 
                    class="w-1/2 h-1/2 object-cover rounded-lg mb-4 mx-auto">
            </div>
            <h2 class="text-2xl font-bold mb-2">${movie.title}</h2>
            <p class="text-gray-600 mb-4">${movie.description}</p>
            <div class="flex space-x-4 space-x-reverse mb-4">
                <span class="text-yellow-500">⭐ ${movie.rating}</span>
                <span class="text-gray-600">👁 ${movie.views}</span>
                <span class="text-blue-600">${movie.genre_name}</span>
                <span class="text-gray-600">${new Date(movie.release_date).toLocaleDateString('fa-IR')}</span>
            </div>
        `;
        
        await loadMovieReviews(movieId);
        document.getElementById('movieModal').classList.remove('hidden');
    } catch (error) {
        console.error('خطا در نمایش جزئیات فیلم:', error);
        alert('خطا در نمایش جزئیات فیلم');
    }
}

// نمایش نظرات 
async function loadMovieReviews(movieId) {
    try {
        const response = await fetch(`http://localhost:3000/api/user/movies/${movieId}/reviews`);
        const reviews = await response.json();
        
        const reviewsContainer = document.getElementById('movieReviews');
        reviewsContainer.innerHTML = '';
        
        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            const username = review.username ? review.username : 'کاربر';
            reviewElement.className = 'bg-gray-100 p-4 rounded';
            reviewElement.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="font-bold">${username}</span>
                    <span class="text-yellow-500">⭐ ${review.rating}</span>
                </div>
                <p class="text-gray-700">${review.comment}</p>
                <span class="text-sm text-gray-500">${new Date(review.created_at).toLocaleDateString('fa-IR')}</span>
            `;
            reviewsContainer.appendChild(reviewElement);
        });
    } catch (error) {
        console.error('خطا در دریافت نظرات:', error);
    }
}

// ثبت نظر کاربر
async function submitReview() {
    const rating = parseInt(document.getElementById('rating').value);
    const comment = document.getElementById('newReview').value;
    
    if (!comment.trim()) {
        alert('لطفاً نظر خود را وارد کنید');
        return;
    }

    if (!rating || rating < 1 || rating > 10) {
        alert('لطفاً امتیازی بین 1 تا 10 وارد کنید');
        return;
    }
    
    try {
        await fetch(`http://localhost:3000/api/user/movies/${currentMovieId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                rating: rating,
                comment
            })
        });
        
        document.getElementById('rating').value = '';
        document.getElementById('newReview').value = '';
        await loadMovieReviews(currentMovieId);
    } catch (error) {
        console.error('خطا در ثبت نظر:', error);
        alert('خطا در ثبت نظر');
    }
}

// توابع مربوط به فیلترها
function applyFilters() {
    const search = document.getElementById('searchInput').value;
    const genre = document.getElementById('genreFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    const filters = {};
    if (search) filters.search = search;
    if (genre) filters.genre = genre;
    if (sortBy) filters.sortBy = sortBy;
    
    loadMovies(filters);
}

// توابع مربوط به تراکنش‌ها
async function showTransactions() {
    try {
        const response = await fetch(`http://localhost:3000/api/user/${currentUser.id}/transactions`);
        const transactions = await response.json();
        
        const transactionsList = document.getElementById('transactionsList');
        transactionsList.innerHTML = '';
        
        transactions.forEach(transaction => {
            const div = document.createElement('div');
            div.className = 'bg-gray-100 p-4 rounded flex justify-between items-center';
            div.innerHTML = `
                <span class="text-${transaction.transaction_type === 'deposit' ? 'green' : 'red'}-600">
                    ${transaction.transaction_type === 'deposit' ? '+' : '-'}$${transaction.amount}
                </span>
                <span class="text-gray-500">${new Date(transaction.transaction_date).toLocaleDateString('fa-IR')}</span>
            `;
            transactionsList.appendChild(div);
        });
        
        document.getElementById('transactionsModal').classList.remove('hidden');
    } catch (error) {
        console.error('خطا در دریافت تراکنش‌ها:', error);
    }
}

// شارژ کردن حساب
async function chargeWallet() {
    const amount = document.getElementById('chargeAmount').value;
    if (!amount || amount <= 0) {
        alert('لطفاً مبلغ معتبر وارد کنید');
        return;
    }
    
    try {
        await fetch(`http://localhost:3000/api/user/${currentUser.id}/charge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: Number(amount) })
        });
        
        document.getElementById('chargeAmount').value = '';
        await updateUserInfo();
        await showTransactions();
    } catch (error) {
        console.error('خطا در شارژ حساب:', error);
    }
}

// توابع مربوط به اشتراک
async function showSubscription() {
    try {
        const response = await fetch(`http://localhost:3000/api/user/${currentUser.id}/subscription`);
        const subscription = await response.json();
        // console.log(subscription)
        const subscriptionDetails = document.getElementById('subscriptionDetails');
        if (subscription) {
            subscriptionDetails.innerHTML = `
                <div class="bg-gray-100 p-4 rounded mb-4">
                    <p class="font-bold mb-2">${subscription.plan_name}</p>
                    <p class="text-gray-600">تاریخ شروع: ${new Date(subscription.start_date).toLocaleDateString('fa-IR')}</p>
                    <p class="text-gray-600">تاریخ پایان: ${new Date(subscription.end_date).toLocaleDateString('fa-IR')}</p>
                </div>
            `;
        } else {
            subscriptionDetails.innerHTML = '<p class="text-gray-500">شما هیچ اشتراک فعالی ندارید</p>';
        }
        
        document.getElementById('subscriptionModal').classList.remove('hidden');
    } catch (error) {
        console.error('خطا در دریافت اطلاعات اشتراک:', error);
    }
}

// خرید اشتراک
async function purchaseSubscription() {
    const plan = document.getElementById('subscriptionPlan').value;
    try {
        // اول چک می‌کنیم آیا اشتراک فعال داره ؟
        const response = await fetch(`http://localhost:3000/api/user/${currentUser.id}/subscription`);
        const currentSubscription = await response.json();
        
        if (currentSubscription) {
            alert('شما در حال حاضر اشتراک فعال دارید');
            return;
        }

        // چک کردن قیمت اشتراک و موجودی کاربر
        let planPrice = 0;
        switch(plan) {
            case 'monthly':
                planPrice = 10;
                break;
            case 'quarterly':
                planPrice = 25;
                break;
            case 'yearly':
                planPrice = 90;
                break;
        }

        if (currentUser.wallet_balance < planPrice) {
            alert(`موجودی حساب شما کافی نیست. لطفاً حساب خود را شارژ کنید.\nموجودی فعلی: $${currentUser.wallet_balance}\nمبلغ مورد نیاز: $${planPrice}`);
            closeSubscriptionModal();
            showTransactions(); // نمایش مودال تراکنش‌ها برای شارژ حساب
            return;
        }

        // اشتراک نداشت و موجودی کافی داشت خرید انجام  میشه
        const purchaseResponse = await fetch(`http://localhost:3000/api/user/${currentUser.id}/subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ plan })
        });

        if (purchaseResponse.ok) {
            alert('اشتراک شما با موفقیت فعال شد');
            await updateUserInfo();
            await showSubscription();
        } else {
            alert('خطا در خرید اشتراک');
        }
    } catch (error) {
        console.error('خطا در خرید اشتراک:', error);
        alert('خطا در خرید اشتراک');
    }
}

// توابع مربوط به تاریخچه تماشا
async function showWatchHistory() {
    try {
        const response = await fetch(`http://localhost:3000/api/user/${currentUser.id}/watch-history`);
        const history = await response.json();
        
        const watchHistoryList = document.getElementById('watchHistoryList');
        watchHistoryList.innerHTML = '';
        
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'bg-gray-100 p-4 rounded flex justify-between items-center';
            div.innerHTML = `
                <div class="flex items-center">
                    <img src="http://localhost:3000/public/images/movies/${item.movie_profile}" 
                         alt="${item.movie_title}" 
                         class="w-16 h-16 object-cover rounded ml-4">
                    <div>
                        <h4 class="font-bold">${item.movie_title}</h4>
                        <span class="text-gray-500">${new Date(item.watched_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                </div>
                <button onclick="showMovieDetails(${item.movie_id})" 
                        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    مشاهده مجدد
                </button>
            `;
            watchHistoryList.appendChild(div);
        });
        
        document.getElementById('watchHistoryModal').classList.remove('hidden');
    } catch (error) {
        console.error('خطا در دریافت تاریخچه تماشا:', error);
    }
}

// توابع بستن مودال‌ها
function closeMovieModal() {
    document.getElementById('movieModal').classList.add('hidden');
    currentMovieId = null;
}

function closeTransactionsModal() {
    document.getElementById('transactionsModal').classList.add('hidden');
}

function closeSubscriptionModal() {
    document.getElementById('subscriptionModal').classList.add('hidden');
}

function closeWatchHistoryModal() {
    document.getElementById('watchHistoryModal').classList.add('hidden');
}