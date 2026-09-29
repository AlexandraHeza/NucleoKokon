import { Link } from 'react-router-dom'

import { KokonMark } from './icons/index.jsx'
import './Logo.css'

/**
 * Logotipo de Núcleo Kokón.
 *
 * `variant="mark"` replica el logo del login aprobado: círculo con la N
 * + wordmark de dos líneas.
 * `variant="isotype"` dibuja el isotipo vectorial que usa el shell
 * interno (Fase 2, `nucleo-kokon-app.html`).
 */
export default function Logo({ height = 35, variant = 'mark', asLink = false, to = '/' }) {
  const content =
    variant === 'isotype' ? (
      <span className="logo logo--mark">
        <KokonMark height={height} />
        <span className="logo-text">
          <span>NÚCLEO</span>
          <strong>KOKÓN</strong>
        </span>
      </span>
    ) : (
      <span className="logo logo--mark">
        <span className="logo-circle" aria-hidden="true">
          N
        </span>
        <span className="logo-text">
          <span>NÚCLEO</span>
          <strong>KOKÓN</strong>
        </span>
      </span>
    )

  if (!asLink) return content

  return (
    <Link to={to} className="logo-link" aria-label="Núcleo Kokón — inicio">
      {content}
    </Link>
  )
}
