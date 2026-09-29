import { useState } from 'react'

import FormField from './FormField.jsx'
import { EyeIcon, EyeOffIcon, LockIcon } from './icons/index.jsx'
import './PasswordField.css'

/**
 * Campo de contraseña con botón de mostrar/ocultar.
 * El botón expone `aria-label` y `aria-pressed` para lectores de pantalla.
 */
export default function PasswordField({
  id,
  label = 'Contraseña',
  value,
  onChange,
  placeholder = 'Tu contraseña',
  error = '',
  autoComplete = 'current-password',
  disabled = false,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <FormField
      id={id}
      label={label}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      icon={<LockIcon />}
      autoComplete={autoComplete}
      disabled={disabled}
      trailing={
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          tabIndex={-1}
        >
          {visible ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
        </button>
      }
    />
  )
}
