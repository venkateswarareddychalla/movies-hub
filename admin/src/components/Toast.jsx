import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter(t => t.id !== id))
  }, [])

  const add = useCallback((toast) => {
    const id = crypto.randomUUID()
    const t = { id, type: toast.type || 'info', message: toast.message || '' }
    setToasts((prev) => [...prev, t])
    setTimeout(() => remove(id), toast.duration ?? 2500)
  }, [remove])

  const value = useMemo(() => ({ addToast: add }), [add])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-3 right-3 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`min-w-[220px] max-w-sm px-3 py-2 rounded shadow text-sm text-white ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-900'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
