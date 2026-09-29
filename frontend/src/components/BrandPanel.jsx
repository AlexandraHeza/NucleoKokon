import Logo from './Logo.jsx'
import './BrandPanel.css'

/**
 * Panel izquierdo de marca (login.html).
 * Círculos decorativos generados con ::before / ::after.
 */
export default function BrandPanel() {
  return (
    <aside className="brand-panel left-panel" aria-label="Núcleo Kokón">
      <Logo height={35} variant="mark" />

      <div className="hero-content">
        <span className="badge">• SOSTENIBILIDAD HUMANA™</span>
        <h1>
          Bienvenida de vuelta
          <br />
          a
          <br />
          tu <span className="italic-serif">proceso.</span>
        </h1>
        <p>
          Retoma tu bitácora, tus hábitos y tu acompañamiento donde los dejaste. No solo organizamos
          procesos: cuidamos la vida que los sostiene.
        </p>
      </div>

      <footer className="footer-left">
        © 2026 Núcleo Kokón — Todos los derechos reservados.
      </footer>
    </aside>
  )
}
