import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import Loading from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../services/api'

export default function UserManagementPage() {
  const empty = { username: '', password: '', roles: ['ROLE_USER'] }
  const [form, setForm] = useState(empty)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { user: currentUser } = useAuth()

  const load = useCallback(() => userApi.list().then(setUsers).catch((e) => setError(e.message)).finally(() => setLoading(false)), [])
  useEffect(() => { load() }, [load])

  const valid = useMemo(() => form.username.trim().length >= 3 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/.test(form.password), [form])
  const toggleRole = (role) => setForm((current) => ({ ...current, roles: current.roles.includes(role) ? current.roles.filter((value) => value !== role) : [...current.roles, role] }))

  const create = async (event) => {
    event.preventDefault(); setError(''); if (!valid) return
    setBusy(true)
    try { await userApi.create(form); setForm(empty); await load() } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const setStatus = async (item) => { try { await userApi.setStatus(item.id, !item.enabled); await load() } catch (e) { setError(e.message) } }
  const remove = async (item) => {
    if (!window.confirm(`Delete user “${item.username}”?`)) return
    try { await userApi.remove(item.id); await load() } catch (e) { setError(e.message) }
  }

  return <div className="page-stack">
    <div className="page-header"><div><span className="eyebrow">Administrator access control</span><h1>User Management</h1><p>Create accounts, assign roles, enable or disable access, and remove users.</p></div></div>
    {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
    <div className="setup-grid">
      <form className="card setup-form" onSubmit={create}>
        <h2>Create user</h2>
        <FormField label="Username" required><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></FormField>
        <FormField label="Temporary password" required hint="8+ characters with uppercase, lowercase, number, and special character."><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></FormField>
        <fieldset className="checkbox-group"><legend>Roles</legend>{['ROLE_USER', 'ROLE_ADMIN'].map((role) => <label key={role}><input type="checkbox" checked={form.roles.includes(role)} onChange={() => toggleRole(role)} />{role.replace('ROLE_', '')}</label>)}</fieldset>
        <button className="button primary" disabled={!valid || busy}>{busy ? 'Creating…' : 'Create user'}</button>
      </form>
      <section className="card setup-list"><div className="section-heading compact"><div><h2>System users</h2><span>{users.length} account(s)</span></div></div>
        {loading ? <Loading /> : <div className="stack-list">{users.map((item) => <article key={item.id}><div className="user-list-info"><span className="avatar">{item.username[0].toUpperCase()}</span><div><strong>{item.username}{item.username === currentUser?.username && ' (you)'}</strong><div className="tag-row">{item.roles.map((role) => <span className="tag" key={role}>{role.replace('ROLE_', '')}</span>)}<span className={`tag ${item.enabled ? 'enabled' : 'disabled'}`}>{item.enabled ? 'Enabled' : 'Disabled'}</span></div><small>Created {new Date(item.createdAt).toLocaleDateString()}</small></div></div><div className="row-actions"><button className="text-button" onClick={() => setStatus(item)}>{item.enabled ? 'Disable' : 'Enable'}</button><button className="text-button danger-text" disabled={item.username === currentUser?.username || item.username === 'admin'} onClick={() => remove(item)}>Delete</button></div></article>)}</div>}
      </section>
    </div>
  </div>
}
