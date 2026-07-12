import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import { dashboardApi } from '../services/api'
import Alert from '../components/Alert'
import Loading from '../components/Loading'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardApi.summary().then(setSummary).catch((err) => setError(err.message))
  }, [])

  const chartData = useMemo(() => summary ? ({
    labels: ['Paying', 'Insurance', 'General'],
    datasets: [
      { label: 'Male', data: [summary.paying.male, summary.insurance.male, summary.general.male] },
      { label: 'Female', data: [summary.paying.female, summary.insurance.female, summary.general.female] },
    ],
  }) : null, [summary])

  if (error) return <Alert type="error">{error}</Alert>
  if (!summary) return <Loading label="Loading live dashboard…" />

  const cards = [
    { title: 'Paying Patients', data: summary.paying, className: 'paying' },
    { title: 'Insurance Patients', data: summary.insurance, className: 'insurance' },
    { title: 'General Patients', data: summary.general, className: 'general' },
  ]

  return (
    <div className="page-stack">
      <div className="page-header">
        <div><span className="eyebrow">Live database overview</span><h1>Dashboard</h1><p>Current patient volume by category and gender.</p></div>
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
    </div>
  )
}
