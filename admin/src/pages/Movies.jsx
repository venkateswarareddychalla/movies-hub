import React, { useEffect, useState } from 'react'
import api from '../api'
import { useToast } from '../components/Toast.jsx'
import { Link } from 'react-router-dom'

const Movies = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToast } = useToast()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.listMovies()
      setMovies(data)
    } catch {
      setError('Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this movie?')) return
    try {
      await api.deleteMovie(id)
      setMovies((prev) => prev.filter((m) => m.id !== id))
      addToast({ type: 'success', message: 'Movie deleted' })
    } catch {
      addToast({ type: 'error', message: 'Failed to delete movie' })
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Movies</h1>
        <button onClick={load} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">Refresh</button>
      </div>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-auto bg-white rounded shadow max-h-[70vh]">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Description</th>
                <th className="text-left p-3">Added By</th>
                <th className="text-left p-3">Votes</th>
                <th className="text-left p-3">Comments</th>
                <th className="text-left p-3">Latest Comment</th>
                <th className="text-left p-3">Created</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movies.map((m, idx) => (
                <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 font-medium">{m.title}</td>
                  <td className="p-3 max-w-[400px] truncate" title={m.description}>{m.description}</td>
                  <td className="p-3">{m.added_by_name || m.added_by}</td>
                  <td className="p-3">{m.votes}</td>
                  <td className="p-3">{m.comments_count ?? 0}</td>
                  <td className="p-3 max-w-[420px]">
                    {m.last_comment_body ? (
                      <div>
                        <div className="truncate" title={m.last_comment_body}>“{m.last_comment_body}”</div>
                        <div className="text-xs text-gray-500 mt-1">
                          — {m.last_comment_user_name || 'User'}{m.last_comment_created_at ? ` • ${new Date(m.last_comment_created_at).toLocaleString()}` : ''}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No comments</span>
                    )}
                  </td>
                  <td className="p-3">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/movies/${m.id}`} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">View</Link>
                      <button onClick={() => remove(m.id)} className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Movies
