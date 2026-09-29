import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import LoginForm from '../components/LoginForm.jsx'
import { AuthContext } from '../context/AuthContext.js'

function renderLogin({ onLogin } = {}) {
  const login = onLogin ?? vi.fn().mockResolvedValue({ nombre: 'Renata' })

  const utils = render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthContext.Provider
        value={{
          user: null,
          booting: false,
          isAuthenticated: false,
          login,
          logout: vi.fn(),
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/app" element={<h1>Panel de la usuaria</h1>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )

  return { ...utils, login }
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra los textos exactos del prototipo', () => {
    renderLogin()

    expect(screen.getByText('ACCESO A LA PLATAFORMA')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /inicia sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /regístrate gratis/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Recordarme')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /olvidaste tu contraseña/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /volver a la landing/i })).toBeInTheDocument()
    expect(screen.getByText('O CONTINÚA CON')).toBeInTheDocument()
  })

  it('asocia cada input con su label', () => {
    renderLogin()

    expect(screen.getByLabelText('CORREO ELECTRÓNICO')).toHaveAttribute(
      'placeholder',
      'tucorreo@ejemplo.com',
    )
    expect(screen.getByLabelText('CONTRASEÑA')).toHaveAttribute('type', 'password')
  })

  it('rechaza el envío con el correo vacío', async () => {
    const user = userEvent.setup()
    const { login } = renderLogin()

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect((await screen.findAllByText('Por favor, completa este campo.')).length).toBeGreaterThan(0)
    expect(login).not.toHaveBeenCalled()
  })

  it('rechaza un correo con formato inválido', async () => {
    const user = userEvent.setup()
    const { login } = renderLogin()

    await user.type(screen.getByLabelText('CORREO ELECTRÓNICO'), 'renata(at)ejemplo')
    await user.type(screen.getByLabelText('CONTRASEÑA'), 'Sostenible2026')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('Introduce un correo electrónico válido.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('exige contraseña', async () => {
    const user = userEvent.setup()
    const { login } = renderLogin()

    await user.type(screen.getByLabelText('CORREO ELECTRÓNICO'), 'renata@ejemplo.com')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('Por favor, completa este campo.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('envía las credenciales y redirige a /app', async () => {
    const user = userEvent.setup()
    const { login } = renderLogin()

    await user.type(screen.getByLabelText('CORREO ELECTRÓNICO'), 'renata@ejemplo.com')
    await user.type(screen.getByLabelText('CONTRASEÑA'), 'Sostenible2026')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'renata@ejemplo.com',
        password: 'Sostenible2026',
        rememberMe: false,
      })
    })
    expect(await screen.findByText('Panel de la usuaria')).toBeInTheDocument()
  })

  it('respeta el estado de Recordarme', async () => {
    const user = userEvent.setup()
    const { login } = renderLogin()

    await user.type(screen.getByLabelText('CORREO ELECTRÓNICO'), 'renata@ejemplo.com')
    await user.type(screen.getByLabelText('CONTRASEÑA'), 'Sostenible2026')
    await user.click(screen.getByLabelText('Recordarme'))
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith(expect.objectContaining({ rememberMe: true }))
    })
  })

  it('muestra el error del servidor sin perder lo ya escrito', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockRejectedValue(new Error('El correo o la contraseña no son correctos.'))
    renderLogin({ onLogin: login })

    await user.type(screen.getByLabelText('CORREO ELECTRÓNICO'), 'renata@ejemplo.com')
    await user.type(screen.getByLabelText('CONTRASEÑA'), 'Incorrecta2026')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('El correo o la contraseña no son correctos.')
    expect(screen.getByLabelText('CORREO ELECTRÓNICO')).toHaveValue('renata@ejemplo.com')
  })

  it('alterna la visibilidad de la contraseña', async () => {
    const user = userEvent.setup()
    renderLogin()

    const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await user.click(toggle)

    expect(screen.getByLabelText('CONTRASEÑA')).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('deshabilita el envío mientras la petición está en curso', async () => {
    const user = userEvent.setup()
    let release
    const login = vi.fn(() => new Promise((resolve) => {
      release = resolve
    }))
    renderLogin({ onLogin: login })

    await user.type(screen.getByLabelText('CONTRASEÑA'), 'Sostenible2026')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    const button = await screen.findByRole('button', { name: /entrar/i })
    await waitFor(() => expect(button).toBeDisabled())
    expect(button).toHaveAttribute('aria-busy', 'true')

    release({ nombre: 'Renata' })
  })

  it('el botón de Google responde en la UI (OAuth pendiente)', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /continuar con google/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /disponible próximamente/i,
    )
  })
})
