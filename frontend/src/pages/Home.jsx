import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useUserContext } from '../context/AppContext'

const VoteButtons = ({ id, votes, onVoted }) => {
  const { isAuthed } = useUserContext()
  const [busy, setBusy] = useState(false)

  const vote = async (voteType) => {
    if (!isAuthed) return alert('Please login to vote')
    setBusy(true)
    try {
      const res = await api.vote(id, voteType)
      onVoted(res.votes)
    } catch {
      alert('Voting failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button disabled={busy} onClick={() => vote(1)} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">+1</button>
      <span className="text-sm font-semibold min-w-8 text-center">{votes}</span>
      <button disabled={busy} onClick={() => vote(-1)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">-1</button>
    </div>
  )
}

const Home = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.listMovies({ q, page, limit })
      setMovies(res.items)
      setTotal(res.total)
    } catch {
      setError('Failed to load movies')
    } finally {
      setLoading(false)
    }
  }, [q, page, limit])

  useEffect(() => { load() }, [load])

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Movies</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e)=>{ setPage(1); setQ(e.target.value) }}
            placeholder="Search by title or description"
            className="border rounded px-3 py-2 w-72 max-w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={load} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">Refresh</button>
        </div>
      </div>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-3">
          {movies.map((m) => (
            <li key={m.id} className="bg-white rounded shadow p-4 flex gap-4 items-start hover:shadow-lg transition-shadow">
              <VoteButtons id={m.id} votes={m.votes} onVoted={(v)=>{
                setMovies(prev => prev.map(x => x.id===m.id?{...x, votes:v}:x))
              }} />
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <Link to={`/movie/${m.id}`} className="text-lg font-semibold hover:underline">{m.title}</Link>
                  <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">Score: {m.votes}</span>
                </div>
                <div className="text-sm text-gray-700 mt-1">{m.description}</div>
                {m.last_comment_body && (
                  <div className="mt-2 text-sm bg-gray-50 border rounded p-2">
                    <div className="text-gray-800 line-clamp-2">“{m.last_comment_body}”</div>
                    <div className="text-xs text-gray-500 mt-1">
                      — {m.last_comment_user_name || 'User'} • {m.last_comment_created_at ? new Date(m.last_comment_created_at).toLocaleString() : ''}
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  <span>Added by {m.added_by_name || 'User'} • {new Date(m.created_at).toLocaleString()}</span>
                  <Link to={`/movie/${m.id}`} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {m.comments_count ?? 0} comments
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Page {page} • Showing {movies.length} of {total}
        </div>
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
    </section>
  )
}

export default Home
