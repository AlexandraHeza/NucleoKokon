import { useId } from 'react'

import { EnvelopeIcon, AlertIcon } from './icons/index.jsx'
import './FormField.css'

/**
 * Campo de formulario con label asociado, ícono y mensaje de error.
 * El error se anuncia con `aria-live` y se enlaza con `aria-describedby`.
 */
export default function FormField({
  id: providedId,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error = '',
  icon = null,
  trailing = null,
  autoComplete,
  inputMode,
  disabled = false,
  hint,
}) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ')

  const inputId = `field-${id}`

  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>

      <div className="field-control">
        {icon && (
          <span className="field-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          name={id}
          className={`field-input ${trailing ? 'has-trailing' : ''}`}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
        />
        {trailing && <span className="field-trailing">{trailing}</span>}
      </div>

      {hint && !error && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <p className="field-error" id={errorId} role="alert">
          <AlertIcon size={14} />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
