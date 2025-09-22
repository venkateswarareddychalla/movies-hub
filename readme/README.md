# MovieHub – Project Overview and Setup

This repository contains a full‑stack Movie Recommendation Board with three apps:

- Frontend (user app) – React + Vite + Tailwind classes only
- Admin (moderation app) – React + Vite + Tailwind classes only
- Backend (API) – Node.js + Express + SQLite

Users can suggest films, vote, and discuss picks. Admins can moderate content.

---

## Features Implemented

- Authentication
  - Register and Login with hashed passwords (bcrypt) and JWT-based auth
  - Current user endpoint `/api/me` to restore sessions

- Movies
  - Create a movie with title + description (auth required)
  - List movies ranked by score (upvotes − downvotes)
  - Vote +1/−1 (one per user per movie; can update vote)
  - Aggregates include `comments_count` and latest comment snippet

- Comments
  - Add comments to any movie (auth required)
  - Edit/Delete by owner; Admin can edit/delete any comment
  - Frontend Movie page shows full thread; Home shows count + latest snippet

- Admin
  - Users list
  - Movies list with delete; shows Comments count and latest comment snippet
  - Comments list with server-side search + pagination + edit/delete
  - Per‑movie admin view with scoped comments + edit/delete

- UI Enhancements (Tailwind classes only)
  - Clean, minimal UI for both apps
  - Home: card hover state, score badge, latest comment preview, comment count pill
  - Movie: skeleton loaders, bordered comment editor, avatars for comments, inline edit/delete
  - Admin: sticky table headers, zebra rows, compact layout
  - Toast notifications (Tailwind-only) for key actions (post/edit/delete/login)

---

## Project Structure

```
movies-hub/
  admin/            # Admin React app
  backend/          # Express + SQLite backend
  frontend/         # User React app
  readme/           # Documentation (this folder)
```

Key files:
- `backend/server.js` – API, SQLite schema initialization, routes, auth middleware
- `frontend/src/pages/Home.jsx` – ranked movie list with search/pagination
- `frontend/src/pages/Movie.jsx` – movie details + full comments thread
- `admin/src/pages/Movies.jsx` – movies table (latest comment + count)
- `admin/src/pages/Comments.jsx` – comments table with pagination + search

---

## Backend – Setup & Run

Requirements: Node 18+

1) Install deps
```
cd backend
npm install
```

2) Environment variables (`backend/.env`)
```
JWT_SECRET=your_jwt_secret_key_here_make_it_strong_and_secure
PORT=3000
```

3) Start
```
npm run server   # nodemon server.js
# or
npm start        # node server.js
```

The first run creates the SQLite DB `backend/database.db` and ensures tables:
- users (id, name, email, password_hash, role, created_at)
- movies (id, title, description, added_by, created_at)
- votes (id, user_id, movie_id, vote_type, created_at)
- comments (id, user_id, movie_id, body, created_at)

Also ensures a default admin user if not found:
- Email: `admin@moviehub.com`
- Password: `admin123`

---

## Frontend (User) – Setup & Run

1) Install deps
```
cd frontend
npm install
```

2) Optional env (`frontend/.env`)
```
VITE_API_BASE=http://localhost:3000
```

3) Start dev
```
npm run dev
```

Open the Vite URL in your browser.

---

## Admin – Setup & Run

1) Install deps
```
cd admin
npm install
```

2) Optional env (`admin/.env`)
```
VITE_API_BASE=http://localhost:3000
```

3) Start dev
```
npm run dev
```

Login with admin credentials (or promote a user to admin).

Promote an existing user to admin (helper script):
```
node backend/scripts/promote_admin.mjs --email=you@example.com
```

---

## API Summary

Auth
- `POST /api/register` – { name, email, password }
- `POST /api/login` – { email, password } → { token, user }
- `GET /api/me` – Bearer token → { id, name, email, role, created_at }

Movies
- `GET /api/movies` – Query: `q`, `page`, `limit` → { items, total, page, limit }
  - Items include vote score, `comments_count`, and latest comment fields
- `GET /api/movies/:id` – single movie with aggregates
- `POST /api/movies` – auth → { title, description }
- `POST /api/movies/:id/vote` – auth → { voteType: 1 | -1 }

Comments
- `GET /api/movies/:id/comments` – list comments for a movie
- `POST /api/movies/:id/comments` – auth → { body }
- `PUT /api/comments/:id` – owner or admin → { body }
- `DELETE /api/comments/:id` – owner or admin

Admin
- `GET /api/admin/users` – admin only
- `GET /api/admin/comments` – admin only; `q`, `page`, `limit` pagination
- `DELETE /api/movies/:id` – admin only

---

## Roles and Access Control

- User
  - Create movies, vote, comment
  - Edit/Delete own comments
- Admin
  - View users, moderate comments and movies
  - Access additional admin endpoints and UI

---

## Notes on Tailwind CSS

- No custom tailwind.config.js used; all styling via utility classes in JSX.
- Vite plugin `@tailwindcss/vite` is used in both frontend and admin.

---

## Deployment Notes

- Backend: host a Node server with persistent storage (for `database.db`).
- Frontend/Admin: deploy to Vercel/Netlify. Set `VITE_API_BASE` env to your backend URL.
- Use a strong `JWT_SECRET` in production and restrict `cors()` to your origins.

---

## What Was Built (AI Assist Summary)

- Implemented Express API with SQLite schema, auth, and routes.
- Built React frontends (user + admin) with Tailwind classnames only.
- Added voting, ranked list, commenting, and admin moderation.
- Added UI polish (hover states, badges, skeletons, avatars, sticky tables).
- Wired notifications with a small Toast component/provider.

If you have any issues starting any app or want additional features (e.g., sort options, per-user profiles, or a dedicated Top page on the frontend), let me know and I can extend this further.
