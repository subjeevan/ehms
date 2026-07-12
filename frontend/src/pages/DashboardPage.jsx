import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import { dashboardApi } from '../services/api'
import Alert from '../components/Alert'
import Loading from '../components/Loading'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [earnings, setEarnings] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.summary().then(setSummary).catch((err) => setError(err.message)),
      dashboardApi.earnings().then(setEarnings).catch((err) => setError(err.message))
    ]).finally(() => setLoading(false))
  }, [])

  const chartData = useMemo(() => summary ? ({
    labels: ['Paying', 'Insurance', 'General'],
    datasets: [
      { label: 'Male', data: [summary.paying.male, summary.insurance.male, summary.general.male] },
      { label: 'Female', data: [summary.paying.female, summary.insurance.female, summary.general.female] },
    ],
  }) : null, [summary])

  const earningsChartData = useMemo(() => earnings ? {
    labels: earnings.total.earnings.map(e => e.patientType),
    datasets: [
      {
        label: 'Total Earnings',
        data: earnings.total.earnings.map(e => parseFloat(e.amount)),
        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        borderColor: ['#FF5252', '#45A697', '#2196F3'],
        borderWidth: 2,
      }
    ],
  } : null, [earnings])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  if (error) return <Alert type="error">{error}</Alert>
  if (!summary || !earnings) return <Loading label="Loading live dashboard…" />

  const cards = [
    { title: 'Paying Patients', data: summary.paying, className: 'paying' },
    { title: 'Insurance Patients', data: summary.insurance, className: 'insurance' },
    { title: 'General Patients', data: summary.general, className: 'general' },
  ]

  return (
    <div className="page-stack">
      <div className="page-header">
        <div><span className="eyebrow">Live database overview</span><h1>Dashboard</h1><p>Current patient volume, earnings, and financial metrics.</p></div>
        <span className="live-pill"><span /> Live</span>
      </div>

      <section className="hero-stat card">
        <div><span>Total registered patients</span><strong>{summary.totalPatients.toLocaleString()}</strong><small>All patient categories</small></div>
        <div className="hero-stat-symbol">+</div>
      </section>

      <section className="summary-grid">
        {cards.map((card) => (
          <article key={card.title} className={`summary-card card ${card.className}`}>
            <div className="summary-card-top"><h2>{card.title}</h2><strong>{card.data.total}</strong></div>
            <div className="gender-split">
              <div><span>Male</span><b>{card.data.male}</b></div>
              <div><span>Female</span><b>{card.data.female}</b></div>
            </div>
          </article>
        ))}
      </section>

      <section className="card chart-card">
        <div className="section-heading"><div><span className="eyebrow">Patient composition</span><h2>Category and gender distribution</h2></div></div>
        <div className="chart-wrapper">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            }}
          />
        </div>
      </section>

      {/* Earnings Overview Section */}
      <section className="earnings-grid">
        {/* Daily Earnings */}
        <article className="card earnings-card">
          <div className="section-heading">
            <div>
              <h3>Today's Earnings</h3>
              <span className="date-label">{new Date(earnings.today.date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="earnings-details">
            <div className="earnings-total">
              <strong>{formatCurrency(earnings.today.total)}</strong>
            </div>
            {earnings.today.earnings.length > 0 ? (
              <div className="earnings-breakdown">
                {earnings.today.earnings.map((item) => (
                  <div key={item.patientType} className="earnings-item">
                    <span>{item.patientType}</span>
                    <strong>{formatCurrency(item.amount)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No earnings today</p>
            )}
          </div>
        </article>

        {/* Monthly Earnings */}
        <article className="card earnings-card">
          <div className="section-heading">
            <div>
              <h3>This Month's Earnings</h3>
              <span className="date-label">{earnings.thisMonth.month}</span>
            </div>
          </div>
          <div className="earnings-details">
            <div className="earnings-total">
              <strong>{formatCurrency(earnings.thisMonth.total)}</strong>
            </div>
            {earnings.thisMonth.earnings.length > 0 ? (
              <div className="earnings-breakdown">
                {earnings.thisMonth.earnings.map((item) => (
                  <div key={item.patientType} className="earnings-item">
                    <span>{item.patientType}</span>
                    <strong>{formatCurrency(item.amount)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No earnings this month</p>
            )}
          </div>
        </article>

        {/* Total Earnings */}
        <article className="card earnings-card total-earnings">
          <div className="section-heading">
            <div>
              <h3>Total Earnings</h3>
              <span className="date-label">All time</span>
            </div>
          </div>
          <div className="earnings-details">
            <div className="earnings-total">
              <strong>{formatCurrency(earnings.total.total)}</strong>
            </div>
            <div className="earnings-stats">
              <div className="stat-item">
                <span>Paid Bills</span>
                <strong>{earnings.total.paidCount}</strong>
              </div>
              <div className="stat-item">
                <span>Pending Bills</span>
                <strong>{earnings.total.pendingCount}</strong>
              </div>
            </div>
            {earnings.total.earnings.length > 0 ? (
              <div className="earnings-breakdown" style={{ marginTop: '1rem' }}>
                {earnings.total.earnings.map((item) => (
                  <div key={item.patientType} className="earnings-item">
                    <span>{item.patientType}</span>
                    <strong>{formatCurrency(item.amount)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No earnings recorded</p>
            )}
          </div>
        </article>
      </section>

      {/* Earnings Chart */}
      <section className="card chart-card">
        <div className="section-heading"><div><span className="eyebrow">Financial overview</span><h2>Total earnings by patient type</h2></div></div>
        <div className="chart-wrapper">
          <Bar
            data={earningsChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            }}
          />
        </div>
      </section>
    </div>
  )
}
