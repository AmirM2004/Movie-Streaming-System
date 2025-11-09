INSERT INTO public.subscriptions (id, plan_name, start_date, end_date, price) VALUES (1, 'quarterly', '2025-01-21', '2025-04-21', 25);
INSERT INTO public.subscriptions (id, plan_name, start_date, end_date, price) VALUES (2, 'monthly', '2025-01-21', '2025-02-21', 10);

INSERT INTO public.genres (id, name) VALUES (1, 'تخیلی');
INSERT INTO public.genres (id, name) VALUES (2, 'ترسناک');
INSERT INTO public.genres (id, name) VALUES (4, 'اکشن');

INSERT INTO public.users (id, username, email, password, admin, wallet_balance, subscription_id) VALUES (2, 'admin1', 'admin1@gmail.com', '$2b$10$7th7apQsMkWd/C6ygpy32ey/uZcEznsxhy5we/9BzEewteDWHljFS', true, 0, null);
INSERT INTO public.users (id, username, email, password, admin, wallet_balance, subscription_id) VALUES (3, 'user2', 'user2@gmail.com', '$2b$10$Z9nBo8McSwxc/6CZsQS0De66IxR/QM7HdQwBLpt6yTTsMhH3Fbz82', false, 100, 2);
INSERT INTO public.users (id, username, email, password, admin, wallet_balance, subscription_id) VALUES (4, 'user1', 'user1@gmail.com', '$2b$10$DTnjLHVHyMaS6WU.WzuPPOo48RGWs2cF0qMwQecnJ8232bMmFACUa', false, 0, null);

INSERT INTO public.wallet_transactions (id, user_id, transaction_type, amount, transaction_date) VALUES (4, 3, 'deposit', 10, '2025-01-21 13:54:32.192346');
INSERT INTO public.wallet_transactions (id, user_id, transaction_type, amount, transaction_date) VALUES (5, 3, 'subscription', -10, '2025-01-21 13:54:38.266648');
INSERT INTO public.wallet_transactions (id, user_id, transaction_type, amount, transaction_date) VALUES (6, 3, 'deposit', 100, '2025-01-21 18:54:44.343414');

INSERT INTO public.movies (id, title, release_date, description, genre_id, profile) VALUES (1, 'The Count of Monte', '2025-01-21', null, 1, '1737442241737-684579677.jpg');
INSERT INTO public.movies (id, title, release_date, description, genre_id, profile) VALUES (2, 'doc', '2025-01-20', null, 2, '1737451812031-237934963.jpg');
INSERT INTO public.movies (id, title, release_date, description, genre_id, profile) VALUES (3, 'Kraven the Hunter 2024', '2025-01-31', null, 4, '1737451846772-703039273.jpg');
INSERT INTO public.movies (id, title, release_date, description, genre_id, profile) VALUES (4, 'the pitt', '2025-01-17', null, 2, '1737451873929-104374121.jpg');
INSERT INTO public.movies (id, title, release_date, description, genre_id, profile) VALUES (5, 'skeleton crew', '2025-01-10', null, 2, '1737451900801-628741984.jpg');
INSERT INTO public.movies (id, title, release_date, description, genre_id, profile) VALUES (6, 'Unstoppable', '2025-01-03', null, 4, '1737451921546-108587817.jpg');
INSERT INTO public.movies (id, title, release_date, description, genre_id, profile) VALUES (9, 'The Apothecary Diaries', '2025-01-27', null, 1, '1737452012334-408578395.jpg');
INSERT INTO public.movies (id, title, release_date, description, genre_id, profile) VALUES (10, 'Alarum', '2026-02-12', null, 1, '1737452075280-771745277.jpg');
INSERT INTO public.movies (id, title, release_date, description, genre_id, profile) VALUES (11, 'Back in Action', '2025-01-03', null, 4, '1737452105455-475150088.jpg');

INSERT INTO public.reviews (id, user_id, movie_id, rating, comment, created_at) VALUES (4, 3, 1, 1, 'BAD', '2025-01-21 14:00:43.558946');
INSERT INTO public.reviews (id, user_id, movie_id, rating, comment, created_at) VALUES (5, 3, 5, 10, 'greate', '2025-01-21 18:53:34.923772');

INSERT INTO public.watch_history (id, user_id, movie_id, watched_at) VALUES (4, 3, 1, '2025-01-21 13:54:43.199851');
INSERT INTO public.watch_history (id, user_id, movie_id, watched_at) VALUES (6, 3, 3, '2025-01-21 14:01:18.478618');
INSERT INTO public.watch_history (id, user_id, movie_id, watched_at) VALUES (7, 3, 4, '2025-01-21 14:01:22.064816');
INSERT INTO public.watch_history (id, user_id, movie_id, watched_at) VALUES (8, 3, 2, '2025-01-21 18:47:55.749462');
INSERT INTO public.watch_history (id, user_id, movie_id, watched_at) VALUES (9, 3, 5, '2025-01-21 18:53:21.317024');