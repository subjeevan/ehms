import { useMemo, useState } from 'react'
import FormField from './FormField'
import Alert from './Alert'
import { emptyPatient, normalizePatient, toPatientPayload, validatePatient } from '../utils/patientValidation'

export default function PatientForm({ initialPatient = null, onSubmit, submitLabel = 'Save patient', busy = false, successMessage = '', onSuccessClear = undefined, onPatientTypeChange = null, selectedCharge = null, formatCurrency = null }) {
  const [values, setValues] = useState(() => initialPatient ? normalizePatient(initialPatient) : structuredClone(emptyPatient))
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [generalError, setGeneralError] = useState('')

  const clientErrors = useMemo(() => validatePatient(values), [values])
  const isValid = Object.keys(clientErrors).length === 0
  const errorFor = (name) => serverErrors[name] || (touched[name] ? clientErrors[name] : '')

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setServerErrors((current) => ({ ...current, [name]: undefined }))
    if (name === 'patientType' && onPatientTypeChange) {
      onPatientTypeChange(value)
    }
  }

  const setInsuranceField = (name, value) => {
    setValues((current) => ({
      ...current,
      insuranceDetail: { ...current.insuranceDetail, [name]: value },
    }))
    setServerErrors((current) => ({ ...current, [`insuranceDetail.${name}`]: undefined }))
  }

  const markTouched = (name) => setTouched((current) => ({ ...current, [name]: true }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    const allTouched = Object.fromEntries(Object.keys(clientErrors).map((key) => [key, true]))
    setTouched((current) => ({ ...current, ...allTouched }))
    setGeneralError('')
    setServerErrors({})
    if (!isValid) return
    try {
      await onSubmit(toPatientPayload(values))
    } catch (error) {
      setGeneralError(error.message)
      setServerErrors(error.fieldErrors || {})
    }
  }

  return (
    <form className="card patient-form" onSubmit={handleSubmit} noValidate>
      {successMessage && <Alert type="success" onClose={onSuccessClear}>{successMessage}</Alert>}
      {generalError && <Alert type="error" onClose={() => setGeneralError('')}>{generalError}</Alert>}

      <div className="section-heading">
        <div>
          <span className="eyebrow">Demographic details</span>
          <h2>Patient information</h2>
        </div>
        <span className="required-note">* Required fields</span>
      </div>

      <div className="form-grid">
        <FormField label="Full name" required error={errorFor('fullName')}>
          <input value={values.fullName} onChange={(e) => setField('fullName', e.target.value)} onBlur={() => markTouched('fullName')} maxLength={150} />
        </FormField>

        <FormField label="Gender" required error={errorFor('gender')}>
          <select value={values.gender} onChange={(e) => setField('gender', e.target.value)} onBlur={() => markTouched('gender')}>
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </FormField>

        <FormField label="Date of birth" required error={errorFor('dateOfBirth')}>
          <input type="date" value={values.dateOfBirth} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setField('dateOfBirth', e.target.value)} onBlur={() => markTouched('dateOfBirth')} />
        </FormField>

        <FormField label="Contact number" required error={errorFor('contactNumber')} hint="Digits, spaces, +, -, and parentheses are accepted.">
          <input value={values.contactNumber} onChange={(e) => setField('contactNumber', e.target.value)} onBlur={() => markTouched('contactNumber')} maxLength={25} />
        </FormField>

        <FormField label="Patient type" required error={errorFor('patientType')}>
          <select value={values.patientType} onChange={(e) => setField('patientType', e.target.value)} onBlur={() => markTouched('patientType')}>
            <option value="">Select patient type</option>
            <option value="GENERAL">General</option>
            <option value="PAYING">Paying</option>
            <option value="INSURANCE">Insurance</option>
          </select>
        </FormField>

        <FormField label="Address" required error={errorFor('address')}>
          <textarea value={values.address} onChange={(e) => setField('address', e.target.value)} onBlur={() => markTouched('address')} maxLength={300} rows={3} />
        </FormField>
      </div>

      {selectedCharge && formatCurrency && values.patientType && (
        <div style={{ backgroundColor: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', padding: '12px 16px', marginBottom: '16px', color: '#004085' }}>
          <strong>Registration Charge:</strong> {formatCurrency(selectedCharge.amount)}
        </div>
      )}

      {values.patientType === 'INSURANCE' && (
        <section className="nested-section">
          <div className="section-heading compact">
            <div><span className="eyebrow">Conditional section</span><h3>Insurance details</h3></div>
          </div>
          <div className="form-grid">
            <FormField label="Provider" required error={errorFor('insuranceDetail.provider')}>
              <input value={values.insuranceDetail.provider} onChange={(e) => setInsuranceField('provider', e.target.value)} onBlur={() => markTouched('insuranceDetail.provider')} maxLength={120} />
            </FormField>
            <FormField label="Policy number" required error={errorFor('insuranceDetail.policyNumber')}>
              <input value={values.insuranceDetail.policyNumber} onChange={(e) => setInsuranceField('policyNumber', e.target.value)} onBlur={() => markTouched('insuranceDetail.policyNumber')} maxLength={100} />
            </FormField>
            <FormField label="Coverage amount" required error={errorFor('insuranceDetail.coverageAmount')}>
              <input type="number" min="0.01" step="0.01" value={values.insuranceDetail.coverageAmount} onChange={(e) => setInsuranceField('coverageAmount', e.target.value)} onBlur={() => markTouched('insuranceDetail.coverageAmount')} />
            </FormField>
            <FormField label="Expiry date" required error={errorFor('insuranceDetail.expiryDate')}>
              <input type="date" min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} value={values.insuranceDetail.expiryDate} onChange={(e) => setInsuranceField('expiryDate', e.target.value)} onBlur={() => markTouched('insuranceDetail.expiryDate')} />
            </FormField>
          </div>
        </section>
      )}

      <div className="form-actions">
        <button type="submit" className="button primary" disabled={!isValid || busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
        {!isValid && <span className="form-status">Complete all required fields to enable submission.</span>}
      </div>
    </form>
  )
}
