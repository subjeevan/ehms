import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'

import { dashboardApi } from '../services/api'
import Alert from '../components/Alert'
import Loading from '../components/Loading'
import './DashboardPage.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
)

const EMPTY_GENDER_COUNT = {
  male: 0,
  female: 0,
  total: 0,
}

function normalizeGenderCount(value) {
  const male = Number(value?.male ?? 0)
  const female = Number(value?.female ?? 0)

  return {
    male,
    female,
    total: Number(value?.total ?? male + female),
  }
}

function normalizeSummary(response) {
  const source = response?.data ?? response ?? {}

  const paying = normalizeGenderCount(source.paying)
  const insurance = normalizeGenderCount(source.insurance)
  const general = normalizeGenderCount(source.general)

  return {
    totalPatients: Number(
        source.totalPatients ??
        paying.total + insurance.total + general.total,
    ),
    paying,
    insurance,
    general,
  }
}

function PatientCard({ title, data, variant }) {
  const safeData = data ?? EMPTY_GENDER_COUNT

  return (
      <article className={`dashboard-stat-card dashboard-stat-card--${variant}`}>
        <div className="dashboard-stat-card__header">
          <div>
            <p className="dashboard-stat-card__label">{title}</p>
            <h2 className="dashboard-stat-card__value">
              {safeData.total.toLocaleString()}
            </h2>
          </div>

          <span className="dashboard-stat-card__icon" aria-hidden="true">
          +
        </span>
        </div>

        <div className="dashboard-stat-card__breakdown">
          <div>
            <span>Male</span>
            <strong>{safeData.male.toLocaleString()}</strong>
          </div>

          <div>
            <span>Female</span>
            <strong>{safeData.female.toLocaleString()}</strong>
          </div>
        </div>
      </article>
  )
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await dashboardApi.summary()
      setSummary(normalizeSummary(response))
    } catch (requestError) {
      console.error('Dashboard loading error:', requestError)

      setError(
          requestError?.message ||
          'Dashboard data could not be loaded. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const cards = useMemo(() => {
    if (!summary) {
      return []
    }

    return [
      {
        title: 'Paying Patients',
        data: summary.paying,
        variant: 'paying',
      },
      {
        title: 'Insurance Patients',
        data: summary.insurance,
        variant: 'insurance',
      },
      {
        title: 'General Patients',
        data: summary.general,
        variant: 'general',
      },
    ]
  }, [summary])

  const chartData = useMemo(() => {
    if (!summary) {
      return null
    }

    return {
      labels: ['Paying', 'Insurance', 'General'],
      datasets: [
        {
          label: 'Male',
          data: [
            summary.paying.male,
            summary.insurance.male,
            summary.general.male,
          ],
          backgroundColor: 'rgba(37, 99, 235, 0.78)',
          borderColor: 'rgb(37, 99, 235)',
          borderWidth: 1,
          borderRadius: 7,
          maxBarThickness: 52,
        },
        {
          label: 'Female',
          data: [
            summary.paying.female,
            summary.insurance.female,
            summary.general.female,
          ],
          backgroundColor: 'rgba(219, 39, 119, 0.72)',
          borderColor: 'rgb(219, 39, 119)',
          borderWidth: 1,
          borderRadius: 7,
          maxBarThickness: 52,
        },
      ],
    }
  }, [summary])

  const chartOptions = useMemo(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 18,
            },
          },
          tooltip: {
            padding: 12,
            displayColors: true,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
            border: {
              display: false,
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.18)',
            },
          },
        },
      }),
      [],
  )

  if (loading) {
    return (
        <div className="dashboard-page">
          <Loading label="Loading dashboard data..." />
        </div>
    )
  }

  return (
      <main className="dashboard-page">
        <section className="dashboard-heading">
          <div>
            <p className="dashboard-heading__eyebrow">Live database overview</p>
            <h1>Dashboard</h1>
            <p className="dashboard-heading__description">
              Current patient registration statistics by category and gender.
            </p>
          </div>

          <div className="dashboard-live-status">
            <span className="dashboard-live-status__dot" />
            Live
          </div>
        </section>

        {error && (
            <div className="dashboard-error">
              <Alert type="error">{error}</Alert>

              <button
                  type="button"
                  className="dashboard-retry-button"
                  onClick={loadDashboard}
              >
                Try again
              </button>
            </div>
        )}

        {!error && summary && (
            <>
              <section className="dashboard-total-card">
                <div>
                  <p>Total registered patients</p>

                  <h2>{summary.totalPatients.toLocaleString()}</h2>

                  <span>All patient categories</span>
                </div>

                <div className="dashboard-total-card__visual" aria-hidden="true">
                  <span>+</span>
                </div>
              </section>

              <section className="dashboard-card-grid">
                {cards.map((card) => (
                    <PatientCard
                        key={card.variant}
                        title={card.title}
                        data={card.data}
                        variant={card.variant}
                    />
                ))}
              </section>

              <section className="dashboard-chart-card">
                <div className="dashboard-chart-card__heading">
                  <div>
                    <p>Patient composition</p>
                    <h2>Category and gender distribution</h2>
                  </div>
                </div>

                <div className="dashboard-chart-wrapper">
                  {chartData && (
                      <Bar data={chartData} options={chartOptions} />
                  )}
                </div>
              </section>
            </>
        )}

        {!error && !summary && (
            <Alert type="info">
              No dashboard information is currently available.
            </Alert>
        )}
      </main>
  )
}