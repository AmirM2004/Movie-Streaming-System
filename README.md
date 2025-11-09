
**Movie Streaming System**

A full-stack web application for managing and consuming movies.

**Admin Panel:**

* **User management:** view, edit, track watched movies, comments, wallet, subscriptions.
* **Movie management:** add, edit, delete movies, upload images, assign genres, track views, ratings, and comments.
* **Genre management:** add, edit, delete genres, track views, comments, average ratings.
* **Transaction history:** view user transactions.

**User Panel:**

* **Browse movies:** search, filter by genre, sort by rating or views.
* **Movie details:** view info, read/write reviews, rate movies.
* **Watch history:** track watched movies.
* **Transactions:** view and charge wallet.
* **Subscriptions:** purchase and view subscription plans.
* **Account management:** login, register, logout.

**Technology Stack:**

* **Frontend:** HTML, CSS, Tailwind, JavaScript.
* **Backend:** Node.js with API endpoints for users, movies, genres, transactions.
* **Database:** stores users, movies, genres, comments, transactions, subscriptions.
* **File uploads:** movie images.
* **Modals:** for adding/editing movies, genres, reviews, transactions, and subscriptions.
* **Responsive layout:** RTL support, dynamic tables and grids.

**Backend API Routes:**

* **Users:**

  * `GET /api/users` – list all users
  * `POST /api/users` – create new user
  * `GET /api/users/:id` – get user details
  * `PUT /api/users/:id` – update user info
  * `DELETE /api/users/:id` – delete user

* **Movies:**

  * `GET /api/movies` – list all movies
  * `POST /api/movies` – add new movie
  * `GET /api/movies/:id` – get movie details
  * `PUT /api/movies/:id` – edit movie
  * `DELETE /api/movies/:id` – delete movie

* **Genres:**

  * `GET /api/genres` – list genres
  * `POST /api/genres` – add genre
  * `PUT /api/genres/:id` – update genre
  * `DELETE /api/genres/:id` – delete genre

* **Transactions:**

  * `GET /api/transactions` – list all transactions
  * `POST /api/transactions` – add transaction (e.g., wallet recharge, subscription)

* **Reviews:**

  * `POST /api/movies/:id/reviews` – submit review
  * `GET /api/movies/:id/reviews` – get all reviews for a movie

* **Authentication:**

  * `POST /api/auth/login` – login
  * `POST /api/auth/register` – register
  * `POST /api/auth/logout` – logout

**Key Features:**

* Full CRUD operations for admin.
* Dynamic rendering of movies, genres, users, and transactions.
* Wallet and subscription management for users.
* Integrated frontend-backend-database workflow.
* Secure authentication and role-based access (admin vs. user).
