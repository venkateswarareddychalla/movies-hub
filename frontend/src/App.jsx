import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AddMovie from './pages/AddMovie.jsx'
import Movie from './pages/Movie.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Nav />
        <main className="max-w-5xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add" element={<AddMovie />} />
            <Route path="/movie/:id" element={<Movie />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App