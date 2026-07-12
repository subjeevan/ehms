import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { clearAuth } = useAuth()
  const navigate = useNavigate()

  const errors = useMemo(() => {
    const result = {}
    if (!form.currentPassword) result.currentPassword = 'Current password is required'
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/.test(form.newPassword)) result.newPassword = 'Use 8-64 characters with uppercase, lowercase, number, and special character'
    if (form.newPassword === form.currentPassword && form.newPassword) result.newPassword = 'New password must be different'
    if (form.confirmNewPassword !== form.newPassword) result.confirmNewPassword = 'Passwords do not match'
    return result
  }, [form])
  const valid = Object.keys(errors).length === 0
  const fieldError = (name) => serverErrors[name] || (touched[name] ? errors[name] : '')

  const submit = async (event) => {
    event.preventDefault(); setTouched({ currentPassword: true, newPassword: true, confirmNewPassword: true }); setError(''); setServerErrors({})
    if (!valid) return
    setBusy(true)
    try {
      const response = await authApi.changePassword(form)
      setMessage(response.message)
      window.setTimeout(() => { clearAuth(); navigate('/login', { replace: true }) }, 1200)
    } catch (e) { setError(e.message); setServerErrors(e.fieldErrors || {}) } finally { setBusy(false) }
  }

  return <div className="page-stack narrow-page">
    <div className="page-header"><div><span className="eyebrow">Account security</span><h1>Change Password</h1><p>Verify your current password and choose a strong replacement.</p></div></div>
    <form className="card account-form" onSubmit={submit}>
      {message && <Alert type="success">{message}</Alert>}{error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      <FormField label="Current password" required error={fieldError('currentPassword')}><input type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} onBlur={() => setTouched({ ...touched, currentPassword: true })} /></FormField>
      <FormField label="New password" required error={fieldError('newPassword')} hint="Include uppercase, lowercase, number, and special character."><input type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} onBlur={() => setTouched({ ...touched, newPassword: true })} /></FormField>
      <FormField label="Confirm new password" required error={fieldError('confirmNewPassword')}><input type="password" autoComplete="new-password" value={form.confirmNewPassword} onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })} onBlur={() => setTouched({ ...touched, confirmNewPassword: true })} /></FormField>
      <button className="button primary" disabled={!valid || busy}>{busy ? 'Updating…' : 'Change password'}</button>
    </form>
  </div>
}
