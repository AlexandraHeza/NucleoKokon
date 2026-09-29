import { Link } from 'react-router-dom'

import './pages.css'

export default function NotFoundPage() {
  return (
    <main className="page" style={{ textAlign: 'center' }}>
      <span className="page-eyebrow">ERROR 404</span>
      <h1 className="page-title">
        Esta ruta no <strong>existe</strong>
      </h1>
      <p className="page-sub">
        <Link to="/login" className="page-link">
          Volver al inicio de sesión
        </Link>
      </p>
    </main>
  )
}
