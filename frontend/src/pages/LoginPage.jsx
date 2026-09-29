import { Navigate } from 'react-router-dom'

import AuthLayout from '../components/AuthLayout.jsx'
import LoginForm from '../components/LoginForm.jsx'
import { useAuth } from '../context/AuthContext.js'

export default function LoginPage() {
  const { isAuthenticated, booting } = useAuth()

  if (booting) {
    return <div className="route-boot" role="status" aria-live="polite" />
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
