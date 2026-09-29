import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.js'
import './pages.css'

/**
 * Marcador de posición de la Fase 2 (shell de la app).
 * Se sustituye por el `AppShell` con sidebar, topbar y vistas reales.
 */
export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="page">
      <span className="page-eyebrow">TU ESPACIO</span>
      <h1 className="page-title">
        Hola, <strong>{user?.nombre ?? 'bienvenida'}</strong>
      </h1>
      <p className="page-sub">
        Sesión iniciada correctamente. El shell de la aplicación (sidebar, Bitácora, Progreso,
        Herramientas y NK Intelligence) llega en la Fase 2.
      </p>
      <button type="button" className="page-link" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </main>
  )
}
