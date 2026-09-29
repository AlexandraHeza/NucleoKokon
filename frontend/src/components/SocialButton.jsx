import { GoogleIcon } from './icons/index.jsx'
import './SocialButton.css'

/**
 * Botón de proveedor externo (`.btn-google` en login.html).
 * El logo es el "G" multicolor oficial embebido como SVG, en lugar del
 * `<img>` remoto de la referencia: mismo resultado visual, sin dependencia
 * de red ni de un host externo.
 */
export default function SocialButton({ provider = 'google', label, onClick, disabled = false }) {
  const text = label ?? 'Continuar con Google'

  return (
    <button
      type="button"
      className="btn-google"
      onClick={onClick}
      disabled={disabled}
      data-provider={provider}
    >
      <span className="btn-google-icon" aria-hidden="true">
        <GoogleIcon size={18} />
      </span>
      <span>{text}</span>
    </button>
  )
}
