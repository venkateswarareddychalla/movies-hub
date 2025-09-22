import 'dotenv/config';
import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const dbPath = path.join(__dirname, 'database.db');

let db = null;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Initialize database and create tables
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        added_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (added_by) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        movie_id INTEGER NOT NULL,
        vote_type INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (movie_id) REFERENCES movies (id),
        UNIQUE(user_id, movie_id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        movie_id INTEGER NOT NULL,
        body TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (movie_id) REFERENCES movies (id)
      );
    `);

    // Create default admin user if not exists
    const adminExists = await db.get('SELECT * FROM users WHERE email = ?', ['admin@moviehub.com']);
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.run(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Admin', 'admin@moviehub.com', hashedPassword, 'admin']
      );
      console.log('Default admin user created');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

// Routes
// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ id: result.lastID, name, email });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Current user profile (used by admin and frontend to restore session)
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get all movies with vote counts
app.get('/api/movies', async (req, res) => {
  try {
    const { q = '', page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    let where = '';
    if (q) {
      where = 'WHERE m.title LIKE ? OR m.description LIKE ?';
      params.push(`%${q}%`, `%${q}%`);
    }

    const movies = await db.all(
      `SELECT m.*, 
              COALESCE(SUM(v.vote_type), 0) as votes,
              COUNT(DISTINCT c.id) as comments_count,
              u.name as added_by_name,
              (
                SELECT cc.body FROM comments cc 
                WHERE cc.movie_id = m.id 
                ORDER BY cc.created_at DESC LIMIT 1
              ) as last_comment_body,
              (
                SELECT uu.name FROM comments cc 
                JOIN users uu ON cc.user_id = uu.id
                WHERE cc.movie_id = m.id 
                ORDER BY cc.created_at DESC LIMIT 1
              ) as last_comment_user_name,
              (
                SELECT cc.created_at FROM comments cc 
                WHERE cc.movie_id = m.id 
                ORDER BY cc.created_at DESC LIMIT 1
              ) as last_comment_created_at
       FROM movies m
       LEFT JOIN votes v ON m.id = v.movie_id
       LEFT JOIN comments c ON m.id = c.movie_id
       LEFT JOIN users u ON m.added_by = u.id
       ${where}
       GROUP BY m.id
       ORDER BY votes DESC, m.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    // total count for pagination
    const countRow = await db.get(
      `SELECT COUNT(*) as total FROM movies m ${where}`,
      params
    );

    res.json({ items: movies, page: pageNum, limit: limitNum, total: countRow.total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Get a single movie by ID with vote counts
app.get('/api/movies/:id', async (req, res) => {
  try {
    const movie = await db.get(`
      SELECT m.*, 
             COALESCE(SUM(v.vote_type), 0) as votes,
             COUNT(DISTINCT c.id) as comments_count,
             u.name as added_by_name,
             (
               SELECT cc.body FROM comments cc 
               WHERE cc.movie_id = m.id 
               ORDER BY cc.created_at DESC LIMIT 1
             ) as last_comment_body,
             (
               SELECT uu.name FROM comments cc 
               JOIN users uu ON cc.user_id = uu.id
               WHERE cc.movie_id = m.id 
               ORDER BY cc.created_at DESC LIMIT 1
             ) as last_comment_user_name,
             (
               SELECT cc.created_at FROM comments cc 
               WHERE cc.movie_id = m.id 
               ORDER BY cc.created_at DESC LIMIT 1
             ) as last_comment_created_at
      FROM movies m
      LEFT JOIN votes v ON m.id = v.movie_id
      LEFT JOIN comments c ON m.id = c.movie_id
      LEFT JOIN users u ON m.added_by = u.id
      WHERE m.id = ?
      GROUP BY m.id
    `, [req.params.id]);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// Add a new movie
app.post('/api/movies', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await db.run(
      'INSERT INTO movies (title, description, added_by) VALUES (?, ?, ?)',
      [title, description, req.user.id]
    );

    const movie = await db.get('SELECT * FROM movies WHERE id = ?', [result.lastID]);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add movie' });
  }
});

// Vote on a movie
app.post('/api/movies/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { voteType } = req.body;
    const movieId = req.params.id;
    const userId = req.user.id;

    if (voteType !== 1 && voteType !== -1) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if movie exists
    const movie = await db.get('SELECT * FROM movies WHERE id = ?', [movieId]);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Check if user already voted
    const existingVote = await db.get(
      'SELECT * FROM votes WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );

    if (existingVote) {
      // Update existing vote
      await db.run(
        'UPDATE votes SET vote_type = ? WHERE user_id = ? AND movie_id = ?',
        [voteType, userId, movieId]
      );
    } else {
      // Create new vote
      await db.run(
        'INSERT INTO votes (user_id, movie_id, vote_type) VALUES (?, ?, ?)',
        [userId, movieId, voteType]
      );
    }

    // Get updated vote count
    const voteResult = await db.get(
      'SELECT COALESCE(SUM(vote_type), 0) as votes FROM votes WHERE movie_id = ?',
      [movieId]
    );

    res.json({ votes: voteResult.votes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

// Get comments for a movie
app.get('/api/movies/:id/comments', async (req, res) => {
  try {
    const comments = await db.all(`
      SELECT c.*, u.name as user_name 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.movie_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.id]);
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a comment
app.post('/api/movies/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { body } = req.body;
    
    if (!body) {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    const result = await db.run(
      'INSERT INTO comments (user_id, movie_id, body) VALUES (?, ?, ?)',
      [req.user.id, req.params.id, body]
    );

    const comment = await db.get(`
      SELECT c.*, u.name as user_name 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.lastID]);

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Admin routes
// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await db.all('SELECT id, name, email, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete a movie (admin only)
app.delete('/api/movies/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await db.run('DELETE FROM movies WHERE id = ?', [req.params.id]);
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

// Delete a comment (admin only)
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await db.get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    // allow if admin or owner
    if (!(req.user.role === 'admin' || req.user.id === comment.user_id)) {
      return res.status(403).json({ error: 'Not permitted' });
    }
    await db.run('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Edit a comment (owner or admin)
app.put('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: 'Comment body is required' });
    const comment = await db.get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (!(req.user.role === 'admin' || req.user.id === comment.user_id)) {
      return res.status(403).json({ error: 'Not permitted' });
    }
    await db.run('UPDATE comments SET body = ? WHERE id = ?', [body, req.params.id]);
    const updated = await db.get(
      `SELECT c.*, u.name as user_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?`,
      [req.params.id]
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// List all comments with user and movie (admin only)
app.get('/api/admin/comments', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { q = '', page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    let where = '';
    if (q) {
      where = `WHERE (c.body LIKE ? OR u.name LIKE ? OR m.title LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const items = await db.all(
      `SELECT c.id, c.body, c.created_at,
              u.id as user_id, u.name as user_name,
              m.id as movie_id, m.title as movie_title
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN movies m ON c.movie_id = m.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
       [...params, limitNum, offset]
    );

    const countRow = await db.get(
      `SELECT COUNT(*) as total
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN movies m ON c.movie_id = m.id
       ${where}`,
       params
    );

    res.json({ items, total: countRow.total, page: pageNum, limit: limitNum });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Start the server
initializeDBAndServer();