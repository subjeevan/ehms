import { useEffect } from 'react'
import { setPageScrollLocked } from '../utils/dom'

export default function PatientDetailModal({ patient, onClose }) {
  useEffect(() => {
    if (!patient) return undefined
    setPageScrollLocked(true)
    const close = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => {
      setPageScrollLocked(false)
      window.removeEventListener('keydown', close)
    }
  }, [patient, onClose])

  if (!patient) return null
  const insurance = patient.insuranceDetail

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <article className="modal-card detail-modal" role="dialog" aria-modal="true" aria-labelledby="patient-detail-title">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Patient #{patient.id}</span>
            <h2 id="patient-detail-title">{patient.fullName}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">×</button>
        </div>
        <dl className="detail-grid">
          <div><dt>Gender</dt><dd>{patient.gender}</dd></div>
          <div><dt>Date of birth</dt><dd>{patient.dateOfBirth}</dd></div>
          <div><dt>Contact</dt><dd>{patient.contactNumber}</dd></div>
          <div><dt>Patient type</dt><dd><span className={`badge type-${patient.patientType.toLowerCase()}`}>{patient.patientType}</span></dd></div>
          <div className="wide"><dt>Address</dt><dd>{patient.address}</dd></div>
          <div className="wide"><dt>Registered</dt><dd>{new Date(patient.registeredAt).toLocaleString()}</dd></div>
          <div><dt>Amount Paid</dt><dd><strong style={{ fontSize: '1.1rem', color: '#28a745' }}>{formatCurrency(patient.amountPaid)}</strong></dd></div>
        </dl>
        {insurance && (
          <section className="insurance-summary">
            <h3>Insurance information</h3>
            <dl className="detail-grid">
              <div><dt>Provider</dt><dd>{insurance.provider}</dd></div>
              <div><dt>Policy number</dt><dd>{insurance.policyNumber}</dd></div>
              <div><dt>Coverage</dt><dd>{Number(insurance.coverageAmount).toLocaleString()}</dd></div>
              <div><dt>Expiry date</dt><dd>{insurance.expiryDate}</dd></div>
            </dl>
          </section>
        )}
      </article>
    </div>
  )
}
