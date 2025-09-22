import React, { useEffect, useState } from 'react'
import api from '../api'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.listUsers()
      setUsers(data)
    } catch (err) {
      setError(err?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <button onClick={load} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">Refresh</button>
      </div>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">{new Date(u.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Users
