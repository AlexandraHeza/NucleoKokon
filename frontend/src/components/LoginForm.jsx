import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import Button from './Button.jsx'
import FormField from './FormField.jsx'
import PasswordField from './PasswordField.jsx'
import SocialButton from './SocialButton.jsx'
import { AlertIcon, ArrowRightIcon, EnvelopeIcon } from './icons/index.jsx'
import { useAuth } from '../context/AuthContext.js'
import './LoginForm.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate({ email, password }) {
  const errors = {}

  if (!email.trim()) {
    errors.email = 'Por favor, completa este campo.'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Introduce un correo electrónico válido.'
  }

  if (!password) {
    errors.password = 'Por favor, completa este campo.'
  }

  return errors
}

export default function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [values, setValues] = useState({ email: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from ?? '/app'

  function handleChange(field) {
    return (event) => {
      const { value } = event.target
      setValues((prev) => ({ ...prev, [field]: value }))
      // Limpia el error del campo en cuanto el usuario corrige
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
      if (formError) setFormError('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return

    const validation = validate(values)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSubmitting(true)
    setFormError('')
    try {
      await login({ email: values.email.trim(), password: values.password, rememberMe })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(error?.message ?? 'No pudimos iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleGoogle() {
    // TODO(auth): conectar con OAuth (Google Identity Services / backend).
    // La interfaz queda operativa; la integración llega en una fase posterior.
    setFormError('El acceso con Google estará disponible próximamente.')
  }

  return (
    <div className="form-wrapper">
      <span className="subtitle">ACCESO A LA PLATAFORMA</span>
      <h2>
        Inicia <strong>sesión</strong>
      </h2>
      <p className="register-link">
        ¿Aún no tienes cuenta? <Link to="/registro">Regístrate gratis</Link>
      </p>

      {formError && (
        <p className="login-alert" role="alert">
          <AlertIcon size={16} />
          <span>{formError}</span>
        </p>
      )}

      <form id="loginForm" className="login-form" onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="CORREO ELECTRÓNICO"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
          icon={<EnvelopeIcon />}
          disabled={submitting}
        />

        <PasswordField
          id="password"
          label="CONTRASEÑA"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={values.password}
          onChange={handleChange('password')}
          error={errors.password}
          disabled={submitting}
        />

        <div className="form-options">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              disabled={submitting}
            />
            Recordarme
          </label>
          <Link to="/recuperar-contrasena" className="forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" loading={submitting} className="login-submit">
          <span>Entrar</span>
          <ArrowRightIcon size={18} />
        </Button>
      </form>

      <div className="divider">O CONTINÚA CON</div>

      <SocialButton provider="google" onClick={handleGoogle} disabled={submitting} />

      <p className="back-link">
        ¿Prefieres explorar primero? <Link to="/">Volver a la landing</Link>
      </p>
    </div>
  )
}
