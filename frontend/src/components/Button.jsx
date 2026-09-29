import './Button.css'

/**
 * Botón primario — estilo exacto de `.btn-primary` en login.html
 * @param {boolean} loading  Spinner y bloqueo durante la petición.
 */
export default function Button({
  children,
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = true,
  className = '',
  ...rest
}) {
  const classes = ['btn-primary', fullWidth ? 'btn-primary--full' : '', loading ? 'is-loading' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      aria-busy={loading || undefined}
      {...rest}
      disabled={disabled || loading}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      <span className="btn-label">{children}</span>
    </button>
  )
}
