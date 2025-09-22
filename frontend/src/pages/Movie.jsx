import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useToast } from '../components/ToastContext.js'
import { useUserContext } from '../context/AppContext'

const Movie = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthed, user } = useUserContext()
  const { addToast } = useToast()
  const [movie, setMovie] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [m, cs] = await Promise.all([
        api.getMovie(id),
        api.listComments(id)
      ])
      setMovie(m)
      setComments(cs)
    } catch {
      setError('Failed to load movie')
    } finally {
      setLoading(false)
    }
  }

  const postComment = async (e) => {
    e.preventDefault()
    if (!isAuthed) return alert('Please login to comment')
    if (!commentBody.trim()) return
    setPosting(true)
    try {
      const c = await api.addComment(id, commentBody.trim())
      setComments(prev => [c, ...prev])
      setCommentBody('')
      addToast({ type: 'success', message: 'Comment posted' })
    } catch {
      addToast({ type: 'error', message: 'Failed to post comment' })
    } finally {
      setPosting(false)
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
      addToast({ type: 'success', message: 'Comment updated' })
    } catch {
      addToast({ type: 'error', message: 'Failed to update comment' })
    }
  }

  const removeComment = async (cid) => {
    if (!confirm('Delete this comment?')) return
    try {
      await api.deleteComment(cid)
      setComments(prev => prev.filter(c => c.id !== cid))
      if (editingId === cid) cancelEdit()
      addToast({ type: 'success', message: 'Comment deleted' })
    } catch {
      addToast({ type: 'error', message: 'Failed to delete comment' })
    }
  }

  useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return (
    <section className="space-y-6 animate-pulse">
      <div className="bg-white rounded shadow p-5">
        <div className="h-6 w-1/3 bg-gray-200 rounded" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>
        <div className="mt-3 h-3 w-1/4 bg-gray-200 rounded" />
      </div>

      <div className="bg-white rounded shadow p-5">
        <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
        <div className="space-y-4">
          <div className="h-20 bg-gray-100 border rounded" />
          <div className="flex gap-3">
            <div className="h-8 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </section>
  )
  if (error) return <div className="text-red-600">{error}</div>
  if (!movie) return <div>Not found</div>

  return (
    <section className="space-y-6">
      <div className="bg-white rounded shadow p-5">
        <h1 className="text-2xl font-bold">{movie.title}</h1>
        <p className="mt-2 text-gray-700 whitespace-pre-line">{movie.description}</p>
        <div className="text-xs text-gray-500 mt-2">Added by {movie.added_by_name || 'User'} • {new Date(movie.created_at).toLocaleString()}</div>
        <div className="mt-3 text-sm font-semibold">Score: {movie.votes}</div>
      </div>

      <div className="bg-white rounded shadow p-5">
        <h2 className="text-xl font-semibold mb-3">Comments</h2>
        {isAuthed ? (
          <form onSubmit={postComment} className="mb-4 space-y-2 border rounded p-3">
            <textarea
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Share your thoughts..."
              value={commentBody}
              onChange={(e)=>setCommentBody(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="submit" disabled={posting || !commentBody.trim()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                {posting ? 'Posting...' : 'Post Comment'}
              </button>
              <button type="button" disabled={posting} onClick={()=>{ setCommentBody(''); navigate('/'); }} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-gray-600 mb-4">Login to add a comment.</div>
        )}
        {comments.length === 0 ? (
          <div className="text-sm text-gray-600">No comments yet.</div>
        ) : (
          <ul className="divide-y">
            {comments.map(c => {
              const isOwner = Boolean(isAuthed && user && c.user_id === user.id)
              const isAdmin = Boolean(isAuthed && user && user.role === 'admin')
              return (
                <li key={c.id} className="pt-3 first:pt-0">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold select-none">
                      {(c.user_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
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
                        {(isOwner || isAdmin) && (
                          <div className="flex gap-2 text-xs">
                            <button onClick={()=>startEdit(c)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Edit</button>
                            <button onClick={()=>{ if (confirm('Delete this comment?')) removeComment(c.id) }} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export default Movie
