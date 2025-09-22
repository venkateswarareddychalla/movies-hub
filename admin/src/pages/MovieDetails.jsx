import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

const MovieDetails = () => {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [m, cs] = await Promise.all([
        api.getMovie(id),
        api.listCommentsForMovie(id)
      ])
      setMovie(m)
      setComments(cs)
    } catch {
      setError('Failed to load movie')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (c) => {
    setEditingId(c.id)
    setEditText(c.body)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const saveEdit = async (cid) => {
    const text = editText.trim()
    if (!text) return
    try {
      const updated = await api.updateComment(cid, text)
      setComments(prev => prev.map(c => c.id === cid ? updated : c))
      cancelEdit()
    } catch {
      alert('Failed to update comment')
    }
  }

  const removeComment = async (cid) => {
    if (!confirm('Delete this comment?')) return
    try {
      await api.deleteComment(cid)
      setComments(prev => prev.filter(c => c.id !== cid))
      if (editingId === cid) cancelEdit()
    } catch {
      alert('Failed to delete comment')
    }
  }

  useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!movie) return <div>Not found</div>

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Movie Details</h1>
        <Link to="/movies" className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">Back to Movies</Link>
      </div>

      <div className="bg-white rounded shadow p-5">
        <div className="text-lg font-semibold">{movie.title}</div>
        <div className="text-sm text-gray-700 mt-1">{movie.description}</div>
        <div className="text-xs text-gray-500 mt-1">Votes: {movie.votes} • Added by {movie.added_by_name || 'User'} • {new Date(movie.created_at).toLocaleString()}</div>
      </div>

      <div className="bg-white rounded shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Comments</h2>
          <button onClick={load} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">Refresh</button>
        </div>
        {comments.length === 0 ? (
          <div className="text-sm text-gray-600">No comments.</div>
        ) : (
          <ul className="space-y-3">
            {comments.map(c => (
              <li key={c.id} className="border-t pt-3 first:border-t-0 first:pt-0">
                {editingId === c.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={editText}
                      onChange={(e)=>setEditText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button onClick={()=>saveEdit(c.id)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                      <button onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-line">{c.body}</div>
                )}
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-gray-500">by {c.user_name} • {new Date(c.created_at).toLocaleString()}</div>
                  {editingId === c.id ? (
                    <></>
                  ) : (
                    <div className="flex gap-2 text-xs">
                      <button onClick={()=>startEdit(c)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Edit</button>
                      <button onClick={()=>removeComment(c.id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default MovieDetails
