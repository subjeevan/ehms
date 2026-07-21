"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { dashboardApi } from "@/lib/api";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const patientTypes = [
  { key: "GENERAL", label: "General" },
  { key: "PAYING", label: "Paying" },
  { key: "INSURANCE", label: "Insurance" },
];

const emptyGenderCount = {
  male: 0,
  female: 0,
  total: 0,
};

const emptyStatusCount = {
  newPatients: { ...emptyGenderCount },
  returningPatients: { ...emptyGenderCount },
  total: 0,
};

const emptySummary = {
  totalPatients: 0,
  totalRegistrations: 0,
  newRegistrations: 0,
  returningRegistrations: 0,
  paying: { ...emptyGenderCount },
  insurance: { ...emptyGenderCount },
  general: { ...emptyGenderCount },
  todayPatients: 0,
  todayNewPatients: 0,
  todayReturningPatients: 0,
  todayPaying: { ...emptyStatusCount },
  todayInsurance: { ...emptyStatusCount },
  todayGeneral: { ...emptyStatusCount },
  monthlyRegistrations: [],
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeGenderCount(value) {
  const male = toNumber(value?.male);
  const female = toNumber(value?.female);

  return {
    male,
    female,
    total: toNumber(value?.total ?? male + female),
  };
}

function normalizeStatusCount(value) {
  const newPatients = normalizeGenderCount(value?.newPatients ?? value);
  const returningPatients = normalizeGenderCount(value?.returningPatients);

  return {
    newPatients,
    returningPatients,
    total: toNumber(value?.total ?? newPatients.total + returningPatients.total),
  };
}

function normalizeSummary(value) {
  const todayPaying = normalizeStatusCount(value?.todayPaying);
  const todayInsurance = normalizeStatusCount(value?.todayInsurance);
  const todayGeneral = normalizeStatusCount(value?.todayGeneral);

  const todayNewPatients = toNumber(
    value?.todayNewPatients ??
      todayPaying.newPatients.total +
        todayInsurance.newPatients.total +
        todayGeneral.newPatients.total,
  );

  const todayReturningPatients = toNumber(
    value?.todayReturningPatients ??
      todayPaying.returningPatients.total +
        todayInsurance.returningPatients.total +
        todayGeneral.returningPatients.total,
  );

  return {
    totalPatients: toNumber(value?.totalPatients),
    totalRegistrations: toNumber(
      value?.totalRegistrations ?? value?.totalPatients,
    ),
    newRegistrations: toNumber(
      value?.newRegistrations ?? value?.totalPatients,
    ),
    returningRegistrations: toNumber(value?.returningRegistrations),
    paying: normalizeGenderCount(value?.paying),
    insurance: normalizeGenderCount(value?.insurance),
    general: normalizeGenderCount(value?.general),
    todayPatients: toNumber(
      value?.todayPatients ?? todayNewPatients + todayReturningPatients,
    ),
    todayNewPatients,
    todayReturningPatients,
    todayPaying,
    todayInsurance,
    todayGeneral,
    monthlyRegistrations: Array.isArray(value?.monthlyRegistrations)
      ? value.monthlyRegistrations
      : [],
  };
}

function normalizeEarningsByType(items) {
  const values = {
    GENERAL: 0,
    PAYING: 0,
    INSURANCE: 0,
  };

  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(values, item?.patientType)) {
        values[item.patientType] = toNumber(item.amount);
      }
    });
  }

  return values;
}

function normalizeEarningsSection(section) {
  return {
    total: toNumber(section?.total),
    byType: normalizeEarningsByType(section?.earnings),
    date: section?.date || "",
    month: section?.month || "",
    paidCount: toNumber(section?.paidCount),
    pendingCount: toNumber(section?.pendingCount),
  };
}

function normalizeEarnings(value) {
  return {
    today: normalizeEarningsSection(value?.today),
    thisMonth: normalizeEarningsSection(value?.thisMonth),
    total: normalizeEarningsSection(value?.total),
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

function EarningsBreakdown({ values }) {
  return (
    <div className="earnings-type-grid">
      {patientTypes.map(({ key, label }) => (
        <div className="earnings-type-item" key={key}>
          <span>{label}</span>
          <strong>{formatCurrency(values?.[key])}</strong>
        </div>
      ))}
    </div>
  );
}

function StatusGenderBreakdown({ label, values }) {
  return (
      <div className="patient-status-row">
        <span className="patient-status-label">{label}</span>

        <span className="patient-status-value">
        {values.male}
      </span>

        <span className="patient-status-value">
        {values.female}
      </span>

        <strong className="patient-status-total">
          {values.total}
        </strong>
      </div>
  );
}
export default function DashboardPage() {
  const { ready, isAdmin } = useAuth();
  const [summary, setSummary] = useState(emptySummary);
  const [earnings, setEarnings] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) {
      return undefined;
    }

    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      const requests = [dashboardApi.summary()];
      if (isAdmin) {
        requests.push(dashboardApi.earnings());
      }

      const results = await Promise.allSettled(requests);
      if (!active) return;

      const messages = [];
      const summaryResult = results[0];

      if (summaryResult.status === "fulfilled") {
        setSummary(normalizeSummary(summaryResult.value));
      } else {
        setSummary(emptySummary);
        messages.push(
          summaryResult.reason?.message ||
            "Could not load dashboard patient data.",
        );
      }

      if (isAdmin) {
        const earningsResult = results[1];
        if (earningsResult?.status === "fulfilled") {
          setEarnings(normalizeEarnings(earningsResult.value));
        } else {
          setEarnings(null);
          messages.push(
            earningsResult?.reason?.message ||
              "Could not load dashboard earnings.",
          );
        }
      } else {
        setEarnings(null);
      }

      setError(messages.join(" "));
      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [ready, isAdmin]);

  const patientCards = useMemo(
    () => [
      {
        label: "Paying patients",
        type: "paying",
        values: summary.todayPaying,
      },
      {
        label: "Insurance patients",
        type: "insurance",
        values: summary.todayInsurance,
      },
      {
        label: "General patients",
        type: "general",
        values: summary.todayGeneral,
      },
    ],
    [summary],
  );

  const chartData = useMemo(() => {
    const rows = summary.monthlyRegistrations;

    return {
      labels: rows.map((item) => item.month),
      datasets: [
        {
          label: "Visit registrations",
          data: rows.map((item) => toNumber(item.count)),
          backgroundColor: "rgba(15, 107, 120, .78)",
          borderRadius: 7,
        },
      ],
    };
  }, [summary.monthlyRegistrations]);

  if (!ready || loading) {
    return <Loading label="Loading dashboard..." />;
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Operations overview</span>
          <h1>Dashboard</h1>
          <p>Live New, Follow-up, patient-type, gender and revenue summary.</p>
        </div>
        <span className="live-pill">
          <span /> Live data
        </span>
      </header>

      {error && <Alert type="error">{error}</Alert>}

      <div className="section-heading dashboard-section-heading">
        <div>
          <span className="eyebrow">All time</span>
          <h2>Patient registration totals</h2>
        </div>
      </div>

      <section className="summary-grid">
        <article className="card summary-card general">
          <div className="summary-card-top">
            <span className="muted">Total registration visits</span>
            <strong>{summary.totalRegistrations}</strong>
          </div>
          <small>{summary.totalPatients} unique patient records</small>
        </article>

        <article className="card summary-card paying">
          <div className="summary-card-top">
            <span className="muted">New patient registrations</span>
            <strong>{summary.newRegistrations}</strong>
          </div>
          <small>First visit registrations</small>
        </article>

        <article className="card summary-card insurance">
          <div className="summary-card-top">
            <span className="muted">Follow-up patient visits</span>
            <strong>{summary.returningRegistrations}</strong>
          </div>
          <small>Returning or old-patient registrations</small>
        </article>
      </section>

      <div className="section-heading dashboard-section-heading">
        <div>
          <span className="eyebrow">Today</span>
          <h2>Today's patient count</h2>
          <p>
            New: {summary.todayNewPatients} · Follow-up: {summary.todayReturningPatients}
          </p>
        </div>
        <span className="live-pill">Total today: {summary.todayPatients}</span>
      </div>

      <section className="summary-grid">
        {patientCards.map(({ label, type, values }) => (
          <article className={`card summary-card ${type}`} key={type}>
            <div className="summary-card-top">
              <span className="muted">{label}</span>
              <strong>{values.total}</strong>
            </div>

            <StatusGenderBreakdown
              label="New patients"
              values={values.newPatients}
            />

            <StatusGenderBreakdown
              label="Follow-up patients"
              values={values.returningPatients}
            />
          </article>
        ))}
      </section>

      {isAdmin && earnings && (
        <>
          <div className="section-heading dashboard-section-heading">
            <div>
              <span className="eyebrow">Admin only</span>
              <h2>Revenue overview</h2>
            </div>
          </div>

          <section className="earnings-grid">
            <article className="card earnings-card total-earnings">
              <span className="eyebrow">Revenue</span>
              <h2>Total earnings</h2>
              <div className="earnings-total">
                <strong>{formatCurrency(earnings.total.total)}</strong>
              </div>
              <EarningsBreakdown values={earnings.total.byType} />
              <small>
                Paid bills: {earnings.total.paidCount} · Pending bills:{" "}
                {earnings.total.pendingCount}
              </small>
            </article>

            <article className="card earnings-card">
              <span className="eyebrow">Today</span>
              <h2>Daily earnings</h2>
              <div className="earnings-total">
                <strong>{formatCurrency(earnings.today.total)}</strong>
              </div>
              <EarningsBreakdown values={earnings.today.byType} />
              <small>{earnings.today.date}</small>
            </article>

            <article className="card earnings-card">
              <span className="eyebrow">Month</span>
              <h2>Monthly earnings</h2>
              <div className="earnings-total">
                <strong>{formatCurrency(earnings.thisMonth.total)}</strong>
              </div>
              <EarningsBreakdown values={earnings.thisMonth.byType} />
              <small>{earnings.thisMonth.month}</small>
            </article>
          </section>
        </>
      )}

      <section className="card chart-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Registration trend</span>
            <h2>Monthly visits</h2>
          </div>
        </div>

        <div className="chart-wrapper">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                  },
                },
              },
            }}
          />
        </div>
      </section>
    </div>
  );
}
