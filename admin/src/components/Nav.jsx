import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from '../api'

const Nav = () => {
  const navigate = useNavigate()
  const authed = Boolean(getToken())

  const logout = () => {
    clearToken()
    navigate('/login')
  }

  const base = 'px-3 py-2 rounded-md text-sm font-medium'
  const active = 'bg-blue-600 text-white'
  const inactive = 'text-gray-700 hover:bg-gray-200'

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold text-blue-700">MovieHub Admin</span>
          {authed && (
            <nav className="flex gap-2">
              <NavLink to="/top" className={({isActive}) => `${base} ${isActive?active:inactive}`}>Top</NavLink>
              <NavLink to="/movies" className={({isActive}) => `${base} ${isActive?active:inactive}`}>Movies</NavLink>
              <NavLink to="/users" className={({isActive}) => `${base} ${isActive?active:inactive}`}>Users</NavLink>
              <NavLink to="/comments" className={({isActive}) => `${base} ${isActive?active:inactive}`}>Comments</NavLink>
            </nav>
          )}
        </div>
        <div>
          {authed ? (
            <button onClick={logout} className="px-3 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-black">Logout</button>
          ) : (
            <NavLink to="/login" className={`${base} ${inactive}`}>Login</NavLink>
          )}
        </div>
      </div>
    </header>
  )
}

export default Nav
