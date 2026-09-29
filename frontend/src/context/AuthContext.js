import { createContext, useContext } from 'react'

/**
 * Contexto de sesión. Separado del provider para que el hook `useAuth`
 * pueda vivir fuera de un componente React y satisfy la regla de
 * react-refresh (un archivo = un export de componente).
 */
export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}

export default AuthContext
