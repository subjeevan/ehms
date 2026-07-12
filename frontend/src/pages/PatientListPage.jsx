import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import ConfirmModal from '../components/ConfirmModal'
import Loading from '../components/Loading'
import Pagination from '../components/Pagination'
import PatientDetailModal from '../components/PatientDetailModal'
import useDebounce from '../hooks/useDebounce'
import { useAuth } from '../context/AuthContext'
import { patientApi, exportPatientsToExcel } from '../services/api'

const columns = [
  ['id', 'ID'], ['fullName', 'Patient'], ['gender', 'Gender'], ['dateOfBirth', 'DOB'], ['patientType', 'Type'], ['amountPaid', 'Amount Paid (¥)'], ['registeredAt', 'Registered'],
]

export default function PatientListPage() {
  const { isAdmin } = useAuth()
  const [query, setQuery] = useState('')
  const search = useDebounce(query, 350)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [sortBy, setSortBy] = useState('registeredAt')
  const [sortDir, setSortDir] = useState('desc')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await patientApi.list({ page, size, search, sortBy, sortDir })
      setData(result)
      if (page > 0 && result.content.length === 0) setPage(page - 1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [page, size, search, sortBy, sortDir])

  useEffect(() => { setPage(0) }, [search, size])
  useEffect(() => { load() }, [load])

  const sort = (field) => {
    if (sortBy === field) setSortDir((dir) => dir === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('asc') }
    setPage(0)
  }

  const confirmDelete = async () => {
    setDeleteBusy(true)
    try {
      await patientApi.remove(deleting.id)
      setDeleting(null)
      await load()
    } catch (requestError) {
      setError(requestError.message)
      setDeleting(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      let allPatients = []
      let currentPage = 0
      let hasMore = true
      
      while (hasMore) {
        const result = await patientApi.list({ page: currentPage, size: 100, search, sortBy, sortDir })
        allPatients = [...allPatients, ...result.content]
        hasMore = currentPage < result.totalPages - 1
        currentPage++
      }

      const filename = `patients_${new Date().toISOString().split('T')[0]}.xlsx`
      exportPatientsToExcel(allPatients, filename)
    } catch (err) {
      setError('Failed to export patients: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div><span className="eyebrow">Searchable patient registry</span><h1>Patient List</h1><p>Live search, sorting, pagination, view, edit, and delete actions.</p></div>
        <Link className="button primary" to="/patients/register">+ Register patient</Link>
      </div>
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      <section className="card table-card">
        <div className="table-toolbar">
          <label className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by ID, name, contact, or address…" /></label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="button secondary" onClick={handleExport} disabled={exporting || !data?.content?.length}>
              {exporting ? 'Exporting...' : '📥 Export to Excel'}
            </button>
            <label className="page-size">Rows <select value={size} onChange={(e) => setSize(Number(e.target.value))}><option>10</option><option>20</option><option>50</option></select></label>
          </div>
        </div>
        {loading && !data ? <Loading label="Loading patient records…" /> : (
          <>
            <div className="table-scroll">
              <table>
                <thead><tr>{columns.map(([field, label]) => (
                  <th key={field}><button type="button" className="sort-button" onClick={() => sort(field)}>{label} {sortBy === field ? (sortDir === 'asc' ? '↑' : '↓') : ''}</button></th>
                ))}<th>Actions</th></tr></thead>
                <tbody>
                  {data?.content?.map((patient) => (
                    <tr key={patient.id}>
                      <td>#{patient.id}</td>
                      <td><strong>{patient.fullName}</strong><small>{patient.contactNumber}</small></td>
                      <td>{patient.gender}</td>
                      <td>{patient.dateOfBirth}</td>
                      <td><span className={`badge type-${patient.patientType.toLowerCase()}`}>{patient.patientType}</span></td>
                      <td><strong>{formatCurrency(patient.amountPaid)}</strong></td>
                      <td>{new Date(patient.registeredAt).toLocaleDateString()}</td>
                      <td><div className="row-actions">
                        <button type="button" className="text-button" onClick={() => setSelected(patient)}>View</button>
                        {isAdmin && <Link className="text-button" to={`/patients/${patient.id}/edit`}>Edit</Link>}
                        {isAdmin && <button type="button" className="text-button danger-text" onClick={() => setDeleting(patient)}>Delete</button>}
                      </div></td>
                    </tr>
                  ))}
                  {!loading && data?.content?.length === 0 && <tr><td colSpan="8" className="empty-cell">No patients matched your search.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>{data?.totalElements ?? 0} patient record(s)</span>
              <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
            </div>
          </>
        )}
        {loading && data && <div className="table-loading-overlay"><span className="spinner" /></div>}
      </section>
      <PatientDetailModal patient={selected} onClose={() => setSelected(null)} />
      <ConfirmModal open={Boolean(deleting)} title="Delete patient record?" message={deleting ? `This will permanently delete #${deleting.id} — ${deleting.fullName}, including related bills.` : ''} busy={deleteBusy} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
    </div>
  )
}
