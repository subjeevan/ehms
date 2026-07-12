import { useEffect, useState } from 'react'
import PatientForm from '../components/PatientForm'
import { patientApi, chargeApi } from '../services/api'

export default function PatientRegistrationPage() {
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState('')
  const [formKey, setFormKey] = useState(0)
  const [charges, setCharges] = useState({})
  const [selectedCharge, setSelectedCharge] = useState(null)
  const [billInfo, setBillInfo] = useState(null)

  useEffect(() => {
    chargeApi.list()
      .then((data) => {
        const chargeMap = {}
        data.forEach((charge) => {
          if (charge.enabled) {
            chargeMap[charge.patientType] = charge
          }
        })
        setCharges(chargeMap)
      })
      .catch((e) => console.error('Failed to load charges:', e.message))
  }, [])

  const handlePatientTypeChange = (patientType) => {
    const charge = charges[patientType]
    setSelectedCharge(charge)
  }

  const save = async (payload) => {
    setBusy(true)
    try {
      const response = await patientApi.createWithBilling(payload)
      setSuccess(`Patient #${response.patient.id} — ${response.patient.fullName} — registered successfully.`)
      if (response.bill) {
        setBillInfo({
          amount: response.bill.amount,
          status: response.bill.paymentStatus,
          billId: response.bill.id,
        })
      }
      setFormKey((key) => key + 1)
      setSelectedCharge(null)
    } finally {
      setBusy(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="page-stack">
      <div className="page-header"><div><span className="eyebrow">New medical record</span><h1>Patient Registration</h1><p>Create a validated patient demographic record without reloading the page.</p></div></div>
      
      {success && (
        <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', padding: '12px 16px', marginBottom: '16px', color: '#155724' }}>
          <strong>Success:</strong> {success}
          {billInfo && (
            <div style={{ marginTop: '12px', marginLeft: '0' }}>
              <p style={{ margin: '4px 0' }}>Registration bill created: <strong>{formatCurrency(billInfo.amount)}</strong></p>
              <p style={{ margin: '4px 0' }}>Payment status: <strong>{billInfo.status}</strong></p>
            </div>
          )}
        </div>
      )}
      
      <PatientForm 
        key={formKey} 
        onSubmit={save} 
        busy={busy} 
        successMessage=""
        onSuccessClear={() => setSuccess('')} 
        submitLabel="Register patient"
        onPatientTypeChange={handlePatientTypeChange}
        selectedCharge={selectedCharge}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}
