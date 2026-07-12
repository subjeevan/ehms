import { useState } from 'react'
import PatientForm from '../components/PatientForm'
import { patientApi } from '../services/api'

export default function PatientRegistrationPage() {
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState('')
  const [formKey, setFormKey] = useState(0)

  const save = async (payload) => {
    setBusy(true)
    try {
      const patient = await patientApi.create(payload)
      setSuccess(`Patient #${patient.id} — ${patient.fullName} — registered successfully.`)
      setFormKey((key) => key + 1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header"><div><span className="eyebrow">New medical record</span><h1>Patient Registration</h1><p>Create a validated patient demographic record without reloading the page.</p></div></div>
      <PatientForm key={formKey} onSubmit={save} busy={busy} successMessage={success} onSuccessClear={() => setSuccess('')} submitLabel="Register patient" />
    </div>
  )
}
