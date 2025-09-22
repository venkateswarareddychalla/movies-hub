import React, { useEffect, useState } from 'react'
import api from '../api'

// Simple leaderboard view for admins
const Top = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.listMovies()
      setMovies(data)
    } catch {
      setError('Failed to load top movies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Top Movies</h1>
        <button onClick={load} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">Refresh</button>
      </div>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ol className="space-y-3 list-decimal list-inside">
          {movies.map((m) => (
            <li key={m.id} className="bg-white rounded shadow p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{m.title}</div>
                  <div className="text-sm text-gray-700 mt-1">{m.description}</div>
                  <div className="text-xs text-gray-500 mt-1">Votes: {m.votes} • Added by {m.added_by_name || 'User'} • {new Date(m.created_at).toLocaleString()}</div>
                </div>
                <div className="text-sm font-bold">Score: {m.votes}</div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default Top
