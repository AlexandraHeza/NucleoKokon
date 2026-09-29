import BrandPanel from './BrandPanel.jsx'
import './AuthLayout.css'

/**
 * Layout de dos columnas iguales del login aprobado:
 * panel de marca (izquierda) + tarjeta de formulario (derecha).
 * Bajo 860px pasa a una sola columna y oculta el panel de marca.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <BrandPanel />
      <section className="auth-form-panel">
        <div className="auth-card">{children}</div>
      </section>
    </div>
  )
}
