import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ roles }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (roles && roles.length && (!user || !roles.includes(user.role))) return <Navigate to="/" replace />
  return <Outlet />
}


