import { useCallback, useEffect, useState } from 'react'
import Alert from '../../components/Alert'
import FormField from '../../components/FormField'
import Loading from '../../components/Loading'
import { chargeApi } from '../../services/api'

export default function ChargeSetupPage() {
  const [charges, setCharges] = useState([])
  const [editingType, setEditingType] = useState(null)
  const [editForm, setEditForm] = useState({ amount: '', enabled: true })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState({})

  const load = useCallback(() => {
    setLoading(true)
    chargeApi
      .list()
      .then((data) => {
        setCharges(data)
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const validateAmount = (value) => {
    const errors = {}
    if (value === '' || value === null) {
      errors.amount = 'Charge amount is required'
    } else if (Number.isNaN(Number(value))) {
      errors.amount = 'Charge amount must be numeric'
    } else if (Number(value) < 0) {
      errors.amount = 'Charge amount cannot be negative'
    }
    return errors
  }

  const handleEdit = (charge) => {
    setEditingType(charge.patientType)
    setEditForm({
      amount: charge.amount.toString(),
      enabled: charge.enabled,
    })
    setValidationErrors({})
    setError('')
  }

  const handleCancel = () => {
    setEditingType(null)
    setEditForm({ amount: '', enabled: true })
    setValidationErrors({})
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setValidationErrors({})

    const errors = validateAmount(editForm.amount)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setBusy(true)
    try {
      const updated = await chargeApi.update(editingType, {
        amount: Number(editForm.amount),
        enabled: editForm.enabled,
      })
      setCharges((current) => current.map((c) => (c.patientType === editingType ? updated : c)))
      setSuccess(`${editingType} charge updated successfully`)
      setEditingType(null)
      setEditForm({ amount: '', enabled: true })
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      if (e.fieldErrors && Object.keys(e.fieldErrors).length > 0) {
        setValidationErrors(e.fieldErrors)
        setError('Validation failed. Please check the form.')
      } else {
        setError(e.message)
      }
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
      <div className="page-header">
        <div>
          <span className="eyebrow">Hospital Administration</span>
          <h1>Charge Setup</h1>
          <p>Configure default registration charges for each patient type.</p>
        </div>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Loading />
      ) : (
        <div className="setup-grid">
          <section className="card setup-list">
            <div className="section-heading compact">
              <div>
                <h2>Patient Type Charges</h2>
                <span>{charges.length} configured</span>
              </div>
            </div>
            {charges.length === 0 ? (
              <p className="muted">No charges configured.</p>
            ) : (
              <div className="stack-list">
                {charges.map((charge) => (
                  <article key={charge.patientType}>
                    <div>
                      <strong>{charge.patientType}</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Amount:</strong> {formatCurrency(charge.amount)}
                        </p>
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Status:</strong> <span style={{ color: charge.enabled ? '#28a745' : '#dc3545' }}>
                            {charge.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="row-actions">
                      <button className="text-button" onClick={() => handleEdit(charge)}>
                        Edit
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {editingType && (
            <form className="card setup-form" onSubmit={handleSubmit}>
              <h2>Edit {editingType} Charge</h2>

              <FormField label="Charge Amount (¥)" required error={validationErrors.amount}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  placeholder="0.00"
                  disabled={busy}
                />
              </FormField>

              <FormField label="Enabled">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={editForm.enabled}
                    onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                    disabled={busy}
                  />
                  <span>Enable automatic billing for this patient type</span>
                </label>
              </FormField>

              <div className="form-actions">
                <button className="button primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Save Charge'}
                </button>
                <button type="button" className="button secondary" onClick={handleCancel} disabled={busy}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
