import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useUserContext } from '../context/AppContext'

const Nav = () => {
  const { isAuthed, user, logout } = useUserContext()
  const navigate = useNavigate()

  const base = 'px-3 py-2 rounded-md text-sm font-medium transition-colors'
  const active = 'bg-blue-600 text-white'
  const inactive = 'text-gray-700 hover:bg-gray-200'

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-blue-700">MovieHub</Link>
          <nav className="flex gap-2">
            <NavLink to="/" className={({isActive}) => `${base} ${isActive?active:inactive}`}>Home</NavLink>
            <NavLink to="/add" className={({isActive}) => `${base} ${isActive? 'bg-blue-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>Add Movie</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <>
              <span className="text-sm text-gray-700">{user?.name || 'Logged in'}</span>
              <button onClick={onLogout} className="px-3 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-black">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={`${base} ${inactive}`}>Login</NavLink>
              <NavLink to="/register" className={`${base} ${inactive}`}>Register</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Nav
