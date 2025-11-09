// بررسی وضعیت لاگین و دسترسی ادمین
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.admin) {
        window.location.href = 'index.html';
        return;
    }

    // نمایش نام ادمین
    document.getElementById('welcomeAdmin').textContent = `مدیر محترم ${user.username} خوش آمدید`;
    
    // لود اطلاعات اولیه
    loadUsers();
    loadMovies();
    loadGenres();
    loadTransactions();
});

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// مدیریت کاربران
async function loadUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/getusers');
        const users = await response.json();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td class="px-4 py-2 text-center">${user.username}</td>
                <td class="px-4 py-2 text-center">${user.email}</td>
                <td class="px-4 py-2 text-center">${user.total_watches}</td>
                <td class="px-4 py-2 text-center">${user.total_comments || 0}</td>
                <td class="px-4 py-2 text-center">${user.wallet_balance}$</td>
                <td class="px-4 py-2 text-center">${user.subscription_end_date}</td>
                <td class="px-4 py-2 text-center">
                    <button onclick="deleteUser(${user.id})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        alert('خطا در بارگذاری اطلاعات کاربران');
    }
}

// حذف کاربران
async function deleteUser(userId) {
    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;
    
    try {
        const response = await fetch('http://localhost:3000/api/admin/delete_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error('خطا در حذف کاربر');
        }

        loadUsers();
        alert('کاربر با موفقیت حذف شد');
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('خطا در حذف کاربر');
    }
}

// مدیریت فیلم‌ها
async function loadMovies() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/getmovie');
        const movies = await response.json();
        const tbody = document.getElementById('moviesTableBody');
        if (movies) {

            tbody.innerHTML = movies.map(movie => `
                <tr>
                    <td class="px-4 py-2 text-center">
                        <img src="http://localhost:3000/public/images/movies/${movie.profile}" 
                             alt="${movie.title}" 
                             class="w-16 h-16 object-cover mx-auto rounded">
                    </td>
                    <td class="px-4 py-2 text-center">${movie.title}</td>
                    <td class="px-4 py-2 text-center">${movie.genre_name}</td>
                    <td class="px-4 py-2 text-center">${new Date(movie.release_date).toLocaleDateString('fa-IR')}</td>
                    <td class="px-4 py-2 text-center">${movie.view_count || 0}</td>
                    <td class="px-4 py-2 text-center">${movie.comment_count || 0}</td>
                    <td class="px-4 py-2 text-center">${movie.rating || '0.0'}</td>
                    <td class="px-4 py-2 text-center">
                        <button onclick="deleteMovie(${movie.id})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        alert('خطا در بارگذاری فیلم‌ها');
    }
}

let currentMovieId = null;

//نمایشاطلاعات فیلم
function showMovieModal(movieId = null) {
    currentMovieId = movieId;
    const modal = document.getElementById('movieModal');
    const title = document.getElementById('movieModalTitle');
    title.textContent = 'افزودن فیلم جدید';
    document.getElementById('movieForm').reset();
    modal.classList.remove('hidden');
}

// بستن فیلم
function closeMovieModal() {
    document.getElementById('movieModal').classList.add('hidden');
    currentMovieId = null;
}

document.getElementById('movieForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('movieTitle').value);
    formData.append('genre', document.getElementById('movieGenre').value);
    formData.append('release_date', document.getElementById('movieReleaseDate').value);

    const imageFile = document.getElementById('movieImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    } else {
        alert('لطفاً یک تصویر انتخاب کنید.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/admin/addmovie', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('خطا در ذخیره فیلم');
        }

        alert('فیلم با موفقیت اضافه شد');
        closeMovieModal();
        loadMovies();
    } catch (error) {
        console.error('Error saving movie:', error);
        alert('خطا در ذخیره فیلم');
    }
});

// حذف فیلم
async function deleteMovie(movieId) {
    if (!confirm('آیا از حذف این فیلم اطمینان دارید؟')) return;

    try {
        const response = await fetch('http://localhost:3000/api/admin/delete_movie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ movieId }), 
        });

        if (!response.ok) {
            throw new Error('خطا در حذف فیلم');
        }

        loadMovies();
        alert('فیلم با موفقیت حذف شد');
    } catch (error) {
        console.error('Error deleting movie:', error);
        alert('خطا در حذف فیلم');
    }
}

// مدیریت ژانرها
async function loadGenres() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/getgenres');
        const genres = await response.json();
        const tbody = document.getElementById('genresTableBody');
        tbody.innerHTML = genres.map(genre => `
            <tr>
                <td class="px-4 py-2 text-center">${genre.name}</td>
                <td class="px-4 py-2 text-center">${genre.view_count || 0}</td>
                <td class="px-4 py-2 text-center">${genre.comment_count || 0}</td>
                <td class="px-4 py-2 text-center">${genre.average_rating || '0.0'}</td>
                <td class="px-4 py-2 text-center">
                    <button onclick="deleteGenre(${genre.id})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // به‌روزرسانی select فیلم‌ها
        const genreSelect = document.getElementById('movieGenre');
        genreSelect.innerHTML = genres.map(genre =>
            `<option value="${genre.id}">${genre.name}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading genres:', error);
        alert('خطا در بارگذاری ژانرها');
    }
}

let currentGenreId = null;

// نمایش ژانر
function showGenreModal(genreId = null) {
    currentGenreId = genreId;
    const modal = document.getElementById('genreModal');
    const title = document.getElementById('genreModalTitle');
    title.textContent = 'افزودن ژانر جدید';
    document.getElementById('genreForm').reset();
    modal.classList.remove('hidden');
}

// بستن ژانر
function closeGenreModal() {
    document.getElementById('genreModal').classList.add('hidden');
    currentGenreId = null;
}

document.getElementById('genreForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('genreName').value;

    if (!name.trim()) {
        alert('لطفاً نام ژانر را وارد کنید.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/admin/add_genres', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            throw new Error('خطا در ذخیره ژانر');
        }

        alert('ژانر با موفقیت اضافه شد');
        closeGenreModal();
        loadGenres();
    } catch (error) {
        console.error('Error saving genre:', error);
        alert('خطا در ذخیره ژانر');
    }
});

// حذف ژانر
async function deleteGenre(genreId) {
    if (!confirm('آیا از حذف این ژانر اطمینان دارید؟')) return;

    try {
        const response = await fetch('http://localhost:3000/api/admin/delete_genre', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ genreId }), 
        });

        if (!response.ok) {
            throw new Error('خطا در حذف ژانر');
        }

        loadGenres();
        alert('ژانر با موفقیت حذف شد');
    } catch (error) {
        console.error('Error deleting genre:', error);
        alert('خطا در حذف ژانر');
    }
}

// تراکنش‌ها
async function loadTransactions() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/loadTransactions');
        const transactions = await response.json();
        console.log(transactions)
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = transactions.map(transaction => `
            <tr>
                <td class="px-4 py-2 text-center">${transaction.username}</td>
                <td class="px-4 py-2 text-center">${getTransactionTypeText(transaction.transaction_type)}</td>
                <td class="px-4 py-2 text-center">${transaction.amount.toLocaleString()}$</td>
                <td class="px-4 py-2 text-center">${new Date(transaction.transaction_date).toLocaleString('fa-IR')}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading transactions:', error);
        alert('خطا در بارگذاری تراکنش‌ها');
    }
}

function getTransactionTypeText(type) {
    const types = {
        'deposit': 'واریز',
        'withdrawal': 'برداشت',
        'subscription': 'خرید اشتراک'
    };
    return types[type] || type;
}

// نمایش/مخفی کردن بخش‌ها
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// نمایش بخش کاربران به صورت پیش‌فرض
showSection('users');