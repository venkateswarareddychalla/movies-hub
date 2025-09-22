import React, { useEffect, useState } from 'react'
import api from '../api'

const Comments = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.listComments({ q, page, limit })
      // res: { items, total, page, limit }
      setComments(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err?.message || 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this comment?')) return
    try {
      await api.deleteComment(id)
      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch {
      alert('Failed to delete comment')
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

  useEffect(() => { load() }, [q, page])

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Comments</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e)=> { setPage(1); setQ(e.target.value) }}
            placeholder="Filter by movie, user, or text"
            className="border rounded px-3 py-2 w-80 max-w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={load} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">Refresh</button>
        </div>
      </div>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Movie</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Comment</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
              {comments.map((c) => (
                <tr key={c.id} className="border-t align-top">
                  <td className="p-3 font-medium">{c.movie_title}</td>
                  <td className="p-3">{c.user_name}</td>
                  <td className="p-3 max-w-[500px]">
                    {editingId === c.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          value={editText}
                          onChange={(e)=>setEditText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button onClick={()=>saveEdit(c.id)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                          <button onClick={cancelEdit} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-line">{c.body}</div>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    {editingId === c.id ? (
                      <></>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => startEdit(c)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Edit</button>
                        <button onClick={() => remove(c.id)} className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Page {page} • Showing {comments.length} of {total}</div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={()=> setPage(p => Math.max(1, p-1))}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >Prev</button>
              <button
                disabled={page * limit >= total}
                onClick={()=> setPage(p => p+1)}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Comments
