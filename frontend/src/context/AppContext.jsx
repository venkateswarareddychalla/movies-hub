import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getToken as getStoredToken, setToken as storeToken, clearToken as clearStoredToken, api } from '../api'

const UserContext = createContext()

export const UserContextProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken())
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) storeToken(token)
    else clearStoredToken()
  }, [token])

  // On mount or token change, fetch profile if needed
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!token || user) return
      try {
        const me = await api.me()
        if (!cancelled) setUser(me)
      } catch {
        if (!cancelled) {
          // token invalid/expired
          setUser(null)
          setToken(null)
          clearStoredToken()
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [token, user])

  const login = (tokenValue, userObj) => {
    setToken(tokenValue)
    setUser(userObj)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    clearStoredToken()
  }

  const value = useMemo(() => ({ token, user, isAuthed: Boolean(token), login, logout }), [token, user])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUserContext = () => useContext(UserContext)
