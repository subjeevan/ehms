import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PatientRegistrationPage from './pages/PatientRegistrationPage'
import PatientListPage from './pages/PatientListPage'
import PatientEditPage from './pages/PatientEditPage'
import PatientUpdatePage from './pages/PatientUpdatePage'
import SetupPage from './pages/SetupPage'
import ChargeSetupPage from './pages/setup/ChargeSetupPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import UserManagementPage from './pages/UserManagementPage'
import AccessDeniedPage from './pages/AccessDeniedPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patients/register" element={<PatientRegistrationPage />} />
          <Route path="/patients" element={<PatientListPage />} />

          <Route element={<RoleRoute role="ROLE_ADMIN" />}>
            <Route path="/patients/:id/edit" element={<PatientEditPage />} />
            <Route path="/patients/update" element={<PatientUpdatePage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/setup/charges" element={<ChargeSetupPage />} />
            <Route path="/users" element={<UserManagementPage />} />
          </Route>

          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
