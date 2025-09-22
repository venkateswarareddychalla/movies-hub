import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getToken, api } from './api'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const token = getToken()
  const [status, setStatus] = useState('checking') // checking | ok | redirect

  useEffect(() => {
    const run = async () => {
      if (!token) return setStatus('redirect')
      try {
        const me = await api.me()
        if (me?.role === 'admin') setStatus('ok')
        else setStatus('redirect')
      } catch {
        setStatus('redirect')
      }
    }
    run()
  }, [token])

  if (status === 'checking') {
    return (
      <div className="p-6 text-center text-sm text-gray-600">Checking admin access...</div>
    )
  }
  if (status !== 'ok') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

export default ProtectedRoute
