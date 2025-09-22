import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useUserContext } from '../context/AppContext'

const AddMovie = () => {
  const { isAuthed } = useUserContext()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!isAuthed) return alert('Please login to add a movie')
    setError('')
    setLoading(true)
    try {
      await api.addMovie(title, description)
      navigate('/')
    } catch {
      setError('Failed to add movie')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthed) {
    return (
      <div className="py-12 text-center">
        <p className="mb-2">You must be logged in to add a movie.</p>
        <Link to="/login" className="text-blue-700 hover:underline">Go to Login</Link>
      </div>
    )
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Suggest a Movie</h1>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <form onSubmit={submit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={4} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Why should we watch it?"/>
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{loading?'Adding...':'Add Movie'}</button>
      </form>
    </section>
  )
}

export default AddMovie
