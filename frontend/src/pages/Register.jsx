import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, setToken } from '../api'
import { useUserContext } from '../context/AppContext'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useUserContext()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.register(name, email, password)
      // After register, login automatically
      const res = await api.login(email, password)
      setToken(res.token)
      login(res.token, res.user)
      navigate('/')
    } catch {
      setError('Registration failed: email may already be registered')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-1 text-center">Create account</h1>
        <p className="text-sm text-gray-600 mb-4 text-center">Join MovieHub to suggest and vote on movies</p>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input type="text" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={(e)=>setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create account'}</button>
        </form>
        <div className="text-center text-sm mt-3">
          Already have an account? <Link to="/login" className="text-blue-700 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
