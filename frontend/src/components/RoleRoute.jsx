import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleRoute({ role }) {
  const { user } = useAuth()
  return user?.roles?.includes(role) ? <Outlet /> : <Navigate to="/access-denied" replace />
}
