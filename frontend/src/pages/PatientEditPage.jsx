import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PatientForm from '../components/PatientForm'
import Loading from '../components/Loading'
import Alert from '../components/Alert'
import { patientApi } from '../services/api'

export default function PatientEditPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [loadingError, setLoadingError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    patientApi.get(id).then(setPatient).catch((err) => setLoadingError(err.message))
  }, [id, version])

  const update = async (payload) => {
    setBusy(true)
    try {
      const saved = await patientApi.update(id, payload)
      setPatient(saved)
      setSuccess(`Patient #${saved.id} updated successfully.`)
      setVersion((value) => value + 1)
    } finally {
      setBusy(false)
    }
  }

  if (loadingError) return <Alert type="error">{loadingError}</Alert>
  if (!patient) return <Loading label="Loading patient information…" />

  return (
    <div className="page-stack">
      <div className="page-header">
        <div><span className="eyebrow">Patient #{patient.id}</span><h1>Edit Patient</h1><p>Update demographic and insurance information.</p></div>
        <Link className="button secondary" to="/patients">Back to list</Link>
      </div>
      <PatientForm key={`${patient.id}-${version}`} initialPatient={patient} onSubmit={update} busy={busy} successMessage={success} onSuccessClear={() => setSuccess('')} submitLabel="Save changes" />
    </div>
  )
}
