import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.js'

/** Ruta protegida: redirige a /login preservando el destino solicitado. */
export default function PrivateRoute({ children }) {
  const { isAuthenticated, booting } = useAuth()
  const location = useLocation()

  if (booting) {
    return (
      <div className="route-boot" role="status" aria-live="polite">
        <span className="sr-only">Cargando tu sesión</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
