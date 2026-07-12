import { useEffect, useState } from 'react'
import Alert from '../components/Alert'
import Loading from '../components/Loading'
import PatientForm from '../components/PatientForm'
import useDebounce from '../hooks/useDebounce'
import { patientApi } from '../services/api'

export default function PatientUpdatePage() {
  const [query, setQuery] = useState('')
  const search = useDebounce(query, 350)
  const [matches, setMatches] = useState([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!search.trim()) { setMatches([]); return }
    setSearching(true)
    patientApi.list({ search, size: 8, sortBy: 'fullName', sortDir: 'asc' })
      .then((result) => setMatches(result.content))
      .catch((err) => setError(err.message))
      .finally(() => setSearching(false))
  }, [search])

  const choose = async (id) => {
    setError('')
    setSuccess('')
    try { setSelected(await patientApi.get(id)); setVersion((value) => value + 1) }
    catch (err) { setError(err.message) }
  }

  const update = async (payload) => {
    setBusy(true)
    try {
      const saved = await patientApi.update(selected.id, payload)
      setSelected(saved)
      setSuccess(`Patient #${saved.id} updated successfully.`)
      setVersion((value) => value + 1)
    } finally { setBusy(false) }
  }

  return (
    <div className="page-stack">
      <div className="page-header"><div><span className="eyebrow">Dedicated record correction</span><h1>Patient Info Update</h1><p>Find a patient by ID or name, load the current record, and update it asynchronously.</p></div></div>
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      <section className="card patient-finder">
        <label className="search-box large"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type patient ID, name, contact, or address…" /></label>
        {searching && <Loading label="Searching…" />}
        {!searching && matches.length > 0 && <div className="search-results">{matches.map((patient) => (
          <button type="button" key={patient.id} onClick={() => choose(patient.id)} className={selected?.id === patient.id ? 'selected' : ''}>
            <span><strong>#{patient.id} {patient.fullName}</strong><small>{patient.contactNumber} · {patient.address}</small></span><span className={`badge type-${patient.patientType.toLowerCase()}`}>{patient.patientType}</span>
          </button>
        ))}</div>}
        {!searching && search && matches.length === 0 && <p className="muted">No matching patient found.</p>}
      </section>
      {selected && <PatientForm key={`${selected.id}-${version}`} initialPatient={selected} onSubmit={update} busy={busy} successMessage={success} onSuccessClear={() => setSuccess('')} submitLabel="Update patient information" />}
    </div>
  )
}
