import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import './estilos.css'

import App from './App.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificacionProvider } from './context/NotificacionContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NotificacionProvider>
        <AuthProvider>
          <CarritoProvider>
            <App />
          </CarritoProvider>
        </AuthProvider>
      </NotificacionProvider>
    </BrowserRouter>
  </StrictMode>
)