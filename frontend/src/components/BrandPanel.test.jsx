import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import BrandPanel from '../components/BrandPanel.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

describe('BrandPanel', () => {
  it('muestra el titular con «proceso.» en la cursiva serif', () => {
    render(<BrandPanel />)

    const title = screen.getByRole('heading', { level: 1 })
    expect(title).toHaveTextContent('Bienvenida de vuelta a tu proceso.')
    expect(title.querySelector('.italic-serif')).toHaveTextContent('proceso.')
  })

  it('conserva los textos de marca', () => {
    render(<BrandPanel />)

    expect(screen.getByText('• SOSTENIBILIDAD HUMANA™')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Retoma tu bitácora, tus hábitos y tu acompañamiento donde los dejaste\./,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText('© 2026 Núcleo Kokón — Todos los derechos reservados.'),
    ).toBeInTheDocument()
  })

  it('muestra el logotipo con el círculo y el wordmark', () => {
    const { container } = render(<BrandPanel />)

    expect(container.querySelector('.logo-circle')).toHaveTextContent('N')
    expect(container.querySelector('.logo-text')).toHaveTextContent('NÚCLEOKOKÓN')
  })
})

describe('AuthLayout', () => {
  it('renderiza el panel de marca junto al contenido del formulario', () => {
    render(
      <AuthLayout>
        <p>Formulario</p>
      </AuthLayout>,
    )

    expect(screen.getByRole('complementary', { name: 'Núcleo Kokón' })).toBeInTheDocument()
    expect(screen.getByText('Formulario')).toBeInTheDocument()
  })
})
