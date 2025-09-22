# MovieHub

A full‑stack Movie Recommendation Board where users can suggest films, vote (+1/−1), and discuss picks. Admins can moderate content. Built with React (Vite) + Tailwind classes only, and Node.js + Express + SQLite.

## Tech Stack
- Frontend: React 19, Vite, Tailwind (utility classes only; no tailwind.config.js)
- Admin: React 19, Vite, Tailwind (utility classes only)
- Backend: Node.js, Express, SQLite (via `sqlite`/`sqlite3`)
- Auth: JWT (Bearer), bcrypt for password hashing

## Monorepo Structure
```
movies-hub/
  admin/            # Admin React app (moderation)
  backend/          # Express API + SQLite DB
  frontend/         # User React app
  readme/           # Additional docs
  README.md         # This file
```

## Features
- Authentication: Register, Login, session restore via `/api/me`
- Movies: Create, list (ranked by score), vote (+1/−1)
- Comments: Add, list per movie, edit/delete by owner; Admin can edit/delete any
- Admin: Users list, Movies moderation (delete), Comments moderation with search + pagination, per-movie comments view
- UI polish: cards with hover, score badge, latest comment snippet, skeleton loaders, avatars for comments, sticky table headers, zebra rows
- Toast notifications: success/error toasts for key actions (Tailwind-only)

## Getting Started

### 1) Backend (API)
```
cd backend
npm install
```
Create `.env` in `backend/`:
```
JWT_SECRET=your_jwt_secret_key_here_make_it_strong_and_secure
PORT=3000
```
Run:
```
npm run server  # dev (nodemon)
# or
npm start       # prod (node)
```
On first run, a SQLite DB `backend/database.db` is created and tables are ensured. A default admin is created if absent:
- Email: `admin@moviehub.com`
- Password: `admin123`

### 2) Frontend (User)
```
cd frontend
npm install
npm run dev
```
Optional `frontend/.env`:
```
VITE_API_BASE=http://localhost:3000
```

### 3) Admin (Moderation)
```
cd admin
npm install
npm run dev
```
Optional `admin/.env`:
```
VITE_API_BASE=http://localhost:3000
```
Login with default admin, or promote a user (see below).

### Promote an existing user to admin
```
node backend/scripts/promote_admin.mjs --email=you@example.com
```

## API At a Glance
- Auth
  - `POST /api/register` → { name, email, password }
  - `POST /api/login` → returns { token, user }
  - `GET /api/me` (auth) → current user
- Movies
  - `GET /api/movies` (q, page, limit) → { items, total, page, limit } with `comments_count` and latest comment fields
  - `GET /api/movies/:id`
  - `POST /api/movies` (auth)
  - `POST /api/movies/:id/vote` (auth) → { voteType: 1 | -1 }
- Comments
  - `GET /api/movies/:id/comments`
  - `POST /api/movies/:id/comments` (auth) → { body }
  - `PUT /api/comments/:id` (owner or admin) → { body }
  - `DELETE /api/comments/:id` (owner or admin)
- Admin
  - `GET /api/admin/users` (admin)
  - `GET /api/admin/comments` (admin, q/page/limit)
  - `DELETE /api/movies/:id` (admin)

## Tailwind Usage
- No `tailwind.config.js`. All styling uses Tailwind utility classnames directly in JSX.
- Vite plugin `@tailwindcss/vite` is used in both frontends.

## Deployment (Vercel)
- `backend/vercel.json` configured to run `server.js` with `@vercel/node`.
- `frontend/vercel.json` and `admin/vercel.json` include rewrites for SPA routing.
- Set environment variables on Vercel:
  - Backend: `JWT_SECRET`, `PORT` (optional), ensure SQLite file persists (use single-region build or external DB for multi-instance)
  - Frontends: `VITE_API_BASE` pointing to the deployed backend URL

## Scripts
- Backend
  - `npm run server` – dev (nodemon)
  - `npm start` – prod
- Frontend/Admin
  - `npm run dev` – dev server
  - `npm run build` – production build

## What Was Built (Summary)
- End‑to‑end MovieHub with users, movies, votes, and discussion
- Clean data model and relations in SQLite
- Role-based access (user vs admin) and robust moderation tools
- Deployment-ready config for Vercel (backend + both frontends)

If you need CI/CD guidance, environment setups, or additional features (sorting, profiles, image uploads, etc.), open an issue or ask for help.
