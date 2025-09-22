import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Movies from './pages/Movies.jsx'
import MovieDetails from './pages/MovieDetails.jsx'
import Users from './pages/Users.jsx'
import Comments from './pages/Comments.jsx'
import Top from './pages/Top.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import Nav from './components/Nav.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Nav />
        <main className="max-w-6xl mx-auto p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={<Navigate to="/movies" replace />}
            />
            <Route
              path="/movies"
              element={
                <ProtectedRoute>
                  <Movies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movies/:id"
              element={
                <ProtectedRoute>
                  <MovieDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/top"
              element={
                <ProtectedRoute>
                  <Top />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comments"
              element={
                <ProtectedRoute>
                  <Comments />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/movies" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App