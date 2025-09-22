import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/Toast.jsx'
import { UserContextProvider } from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContextProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </UserContextProvider>
  </StrictMode>,
)
