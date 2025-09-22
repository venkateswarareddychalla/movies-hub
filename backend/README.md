# MovieHub - Backend

This is the backend server for MovieHub, a movie recommendation board where users can suggest films, vote on them, and discuss picks.

## Features

- User authentication (register, login)
- Movie suggestions with titles and descriptions
- Upvote/downvote movies (one vote per user per movie)
- Comment on movies
- Admin panel for content moderation
- RESTful API endpoints

## Tech Stack

- Node.js with Express
- SQLite database
- JWT for authentication
- Bcrypt for password hashing
- CORS for cross-origin requests

## Setup Instructions

1. Make sure you have Node.js (v14 or later) installed
2. Clone the repository
3. Navigate to the backend directory:
   ```bash
   cd backend
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   The server will start at http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
  - Body: `{ "name": "string", "email": "string", "password": "string" }`

- `POST /api/login` - Login user
  - Body: `{ "email": "string", "password": "string" }`
  - Returns: `{ "token": "jwt_token", "user": { ... } }`

### Movies
- `GET /api/movies` - Get all movies with vote counts
- `POST /api/movies` - Add a new movie (requires auth)
  - Body: `{ "title": "string", "description": "string" }`

### Votes
- `POST /api/movies/:id/vote` - Vote on a movie (requires auth)
  - Body: `{ "voteType": 1 }` (1 for upvote, -1 for downvote)

### Comments
- `GET /api/movies/:id/comments` - Get comments for a movie
- `POST /api/movies/:id/comments` - Add a comment (requires auth)
  - Body: `{ "body": "string" }`

### Admin (requires admin role)
- `GET /api/admin/users` - Get all users
- `DELETE /api/movies/:id` - Delete a movie
- `DELETE /api/comments/:id` - Delete a comment

## Default Admin User
- Email: admin@moviehub.com
- Password: admin123

## Environment Variables
Create a `.env` file in the backend directory with the following variables:
```
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

## License
ISC
