import { createContext, useContext, useRef, useState } from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'

const NotificacionContext = createContext()
export const useNotificacion = () => useContext(NotificacionContext)

const ESTILOS = {
  success: { icono: 'bi-check-circle-fill',        texto: 'text-white', cierre: 'btn-close-white' },
  danger:  { icono: 'bi-x-circle-fill',            texto: 'text-white', cierre: 'btn-close-white' },
  warning: { icono: 'bi-exclamation-triangle-fill', texto: 'text-dark',  cierre: '' },
}

export function NotificacionProvider({ children }) {
  const [avisos, setAvisos] = useState([])
  const siguienteId = useRef(0)

  const notificar = (mensaje, tipo = 'success') => {
    const id = siguienteId.current++
    setAvisos((prev) => [...prev, { id, mensaje, tipo }])
  }

  const quitar = (id) => setAvisos((prev) => prev.filter((a) => a.id !== id))

  return (
    <NotificacionContext.Provider value={{ notificar }}>
      {children}

      <ToastContainer position="top-center" className="position-fixed p-3 mt-5">
        {avisos.map((a) => {
          const estilo = ESTILOS[a.tipo] ?? ESTILOS.success
          return (
            <Toast
              key={a.id}
              bg={a.tipo}
              className={`${estilo.texto} border-0 shadow`}
              autohide
              delay={4500}
              onClose={() => quitar(a.id)}
            >
              <Toast.Body className="d-flex align-items-center gap-2 fw-semibold">
                <i className={`bi ${estilo.icono} fs-5`}></i>
                <span className="flex-grow-1">{a.mensaje}</span>
                <button
                  type="button"
                  className={`btn-close ${estilo.cierre}`}
                  aria-label="Cerrar aviso"
                  onClick={() => quitar(a.id)}
                />
              </Toast.Body>
            </Toast>
          )
        })}
      </ToastContainer>
    </NotificacionContext.Provider>
  )
}
