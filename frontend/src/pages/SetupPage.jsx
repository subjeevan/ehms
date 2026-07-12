import { useCallback, useEffect, useState } from 'react'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import Loading from '../components/Loading'
import { departmentApi, doctorApi, settingApi } from '../services/api'

function DepartmentsPanel() {
  const empty = { name: '', description: '' }
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => departmentApi.list().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false)), [])
  useEffect(() => { load() }, [load])

  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (!form.name.trim() || !form.description.trim()) return setError('Name and description are required.')
    setBusy(true)
    try {
      if (editId) await departmentApi.update(editId, form); else await departmentApi.create(form)
      setForm(empty); setEditId(null); await load()
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  const edit = (item) => { setEditId(item.id); setForm({ name: item.name, description: item.description }) }
  const remove = async (item) => {
    if (!window.confirm(`Delete department “${item.name}”? Doctors will be detached from this department.`)) return
    try { await departmentApi.remove(item.id); await load() } catch (e) { setError(e.message) }
  }

  return <div className="setup-grid">
    <form className="card setup-form" onSubmit={submit}>
      <h2>{editId ? 'Edit department' : 'Add department'}</h2>
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      <FormField label="Department name" required><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} /></FormField>
      <FormField label="Description" required><textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} /></FormField>
      <div className="form-actions"><button className="button primary" disabled={busy}>{busy ? 'Saving…' : editId ? 'Save department' : 'Add department'}</button>{editId && <button type="button" className="button secondary" onClick={() => { setEditId(null); setForm(empty) }}>Cancel</button>}</div>
    </form>
    <section className="card setup-list"><div className="section-heading compact"><div><h2>Departments</h2><span>{items.length} configured</span></div></div>
      {loading ? <Loading /> : <div className="stack-list">{items.map((item) => <article key={item.id}><div><strong>{item.name}</strong><p>{item.description}</p></div><div className="row-actions"><button className="text-button" onClick={() => edit(item)}>Edit</button><button className="text-button danger-text" onClick={() => remove(item)}>Delete</button></div></article>)}{!items.length && <p className="muted">No departments configured.</p>}</div>}
    </section>
  </div>
}

function DoctorsPanel() {
  const empty = { fullName: '', specialization: '', contactNumber: '', departmentIds: [] }
  const [items, setItems] = useState([])
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [doctorList, departmentList] = await Promise.all([doctorApi.list(), departmentApi.list()])
      setItems(doctorList); setDepartments(departmentList)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const toggleDepartment = (id) => setForm((current) => ({
    ...current,
    departmentIds: current.departmentIds.includes(id) ? current.departmentIds.filter((value) => value !== id) : [...current.departmentIds, id],
  }))

  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (!form.fullName.trim() || !form.specialization.trim() || !form.contactNumber.trim()) return setError('Name, specialization, and contact are required.')
    setBusy(true)
    try {
      if (editId) await doctorApi.update(editId, form); else await doctorApi.create(form)
      setForm(empty); setEditId(null); await load()
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  const edit = (item) => {
    setEditId(item.id)
    setForm({ fullName: item.fullName, specialization: item.specialization, contactNumber: item.contactNumber, departmentIds: item.departments.map((d) => d.id) })
  }
  const remove = async (item) => {
    if (!window.confirm(`Delete doctor “${item.fullName}”?`)) return
    try { await doctorApi.remove(item.id); await load() } catch (e) { setError(e.message) }
  }

  return <div className="setup-grid">
    <form className="card setup-form" onSubmit={submit}>
      <h2>{editId ? 'Edit doctor' : 'Add doctor'}</h2>
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      <FormField label="Full name" required><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></FormField>
      <FormField label="Specialization" required><input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></FormField>
      <FormField label="Contact number" required><input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} /></FormField>
      <fieldset className="checkbox-group"><legend>Departments</legend>{departments.map((department) => <label key={department.id}><input type="checkbox" checked={form.departmentIds.includes(department.id)} onChange={() => toggleDepartment(department.id)} />{department.name}</label>)}</fieldset>
      <div className="form-actions"><button className="button primary" disabled={busy}>{busy ? 'Saving…' : editId ? 'Save doctor' : 'Add doctor'}</button>{editId && <button type="button" className="button secondary" onClick={() => { setEditId(null); setForm(empty) }}>Cancel</button>}</div>
    </form>
    <section className="card setup-list"><div className="section-heading compact"><div><h2>Doctors</h2><span>{items.length} configured</span></div></div>
      {loading ? <Loading /> : <div className="stack-list">{items.map((item) => <article key={item.id}><div><strong>{item.fullName}</strong><p>{item.specialization} · {item.contactNumber}</p><div className="tag-row">{item.departments.map((d) => <span className="tag" key={d.id}>{d.name}</span>)}</div></div><div className="row-actions"><button className="text-button" onClick={() => edit(item)}>Edit</button><button className="text-button danger-text" onClick={() => remove(item)}>Delete</button></div></article>)}{!items.length && <p className="muted">No doctors configured.</p>}</div>}
    </section>
  </div>
}

function SettingsPanel() {
  const empty = { settingKey: '', settingValue: '', description: '' }
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const load = useCallback(() => settingApi.list().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false)), [])
  useEffect(() => { load() }, [load])

  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (!form.settingKey.trim() || !form.settingValue.trim()) return setError('Setting key and value are required.')
    setBusy(true)
    try {
      if (editId) await settingApi.update(editId, form); else await settingApi.create(form)
      setForm(empty); setEditId(null); await load()
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const edit = (item) => { setEditId(item.id); setForm({ settingKey: item.settingKey, settingValue: item.settingValue, description: item.description || '' }) }
  const remove = async (item) => {
    if (!window.confirm(`Delete setting “${item.settingKey}”?`)) return
    try { await settingApi.remove(item.id); await load() } catch (e) { setError(e.message) }
  }

  return <div className="setup-grid">
    <form className="card setup-form" onSubmit={submit}>
      <h2>{editId ? 'Edit setting' : 'Add system setting'}</h2>
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      <FormField label="Setting key" required hint="Example: hospital.name"><input value={form.settingKey} onChange={(e) => setForm({ ...form, settingKey: e.target.value })} /></FormField>
      <FormField label="Setting value" required><textarea rows="3" value={form.settingValue} onChange={(e) => setForm({ ...form, settingValue: e.target.value })} /></FormField>
      <FormField label="Description"><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
      <div className="form-actions"><button className="button primary" disabled={busy}>{busy ? 'Saving…' : editId ? 'Save setting' : 'Add setting'}</button>{editId && <button type="button" className="button secondary" onClick={() => { setEditId(null); setForm(empty) }}>Cancel</button>}</div>
    </form>
    <section className="card setup-list"><div className="section-heading compact"><div><h2>System settings</h2><span>{items.length} configured</span></div></div>
      {loading ? <Loading /> : <div className="stack-list">{items.map((item) => <article key={item.id}><div><strong><code>{item.settingKey}</code></strong><p>{item.settingValue}</p><small>{item.description}</small></div><div className="row-actions"><button className="text-button" onClick={() => edit(item)}>Edit</button><button className="text-button danger-text" onClick={() => remove(item)}>Delete</button></div></article>)}{!items.length && <p className="muted">No settings configured.</p>}</div>}
    </section>
  </div>
}

export default function SetupPage() {
  const [tab, setTab] = useState('departments')
  return <div className="page-stack">
    <div className="page-header"><div><span className="eyebrow">Administrator master data</span><h1>Setup</h1><p>Manage departments, doctors, and system configuration.</p></div></div>
    <div className="tabs" role="tablist">{['departments', 'doctors', 'settings'].map((item) => <button type="button" key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
    {tab === 'departments' && <DepartmentsPanel />}
    {tab === 'doctors' && <DoctorsPanel />}
    {tab === 'settings' && <SettingsPanel />}
  </div>
}
