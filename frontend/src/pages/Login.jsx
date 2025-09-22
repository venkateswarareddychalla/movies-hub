import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { api, setToken } from '../api'
import { useUserContext } from '../context/AppContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useUserContext()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login(email, password)
      setToken(res.token)
      login(res.token, res.user)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid credentials or server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-1 text-center">Login</h1>
        <p className="text-sm text-gray-600 mb-4 text-center">Welcome back to MovieHub</p>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="text-center text-sm mt-3">
          New here? <Link to="/register" className="text-blue-700 hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
