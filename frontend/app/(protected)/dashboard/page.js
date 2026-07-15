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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
);

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

const emptySummary = {
  totalPatients: 0,

  paying: { ...emptyGenderCount },
  insurance: { ...emptyGenderCount },
  general: { ...emptyGenderCount },

  todayPatients: 0,
  todayPaying: { ...emptyGenderCount },
  todayInsurance: { ...emptyGenderCount },
  todayGeneral: { ...emptyGenderCount },

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

function normalizeSummary(value) {
  const todayPaying = normalizeGenderCount(
    value?.todayPaying ?? value?.paying,
  );

  const todayInsurance = normalizeGenderCount(
    value?.todayInsurance ?? value?.insurance,
  );

  const todayGeneral = normalizeGenderCount(
    value?.todayGeneral ?? value?.general,
  );

  return {
    totalPatients: toNumber(value?.totalPatients),

    paying: normalizeGenderCount(value?.paying),
    insurance: normalizeGenderCount(value?.insurance),
    general: normalizeGenderCount(value?.general),

    todayPatients: toNumber(
      value?.todayPatients ??
        todayPaying.total + todayInsurance.total + todayGeneral.total,
    ),
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

      // Normal USER accounts never call the ADMIN-only earnings API.
      if (isAdmin) {
        requests.push(dashboardApi.earnings());
      }

      const results = await Promise.allSettled(requests);

      if (!active) {
        return;
      }

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
        // Revenue is completely hidden for normal users.
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
          label: "Patient registrations",
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
          <p>Live patient, registration and revenue summary.</p>
        </div>

        <span className="live-pill">
          <span /> Live data
        </span>
      </header>

      {error && <Alert type="error">{error}</Alert>}

      <section className="card hero-stat">
        <div>
          <span>Total registered patients</span>
          <strong>{summary.totalPatients}</strong>
          <small>Complete hospital patient records</small>
        </div>

        <div className="hero-stat-symbol">+</div>
      </section>

      <div className="section-heading dashboard-section-heading">
        <div>
          <span className="eyebrow">Today</span>
          <h2>Today's patient count</h2>
        </div>

        <span className="live-pill">
          Total today: {summary.todayPatients}
        </span>
      </div>

      <section className="summary-grid">
        {patientCards.map(({ label, type, values }) => (
          <article
            className={`card summary-card ${type}`}
            key={type}
          >
            <div className="summary-card-top">
              <span className="muted">{label}</span>
              <strong>{values.total}</strong>
            </div>

            <div className="gender-split">
              <div>
                <span>Male</span>
                <strong>{values.male}</strong>
              </div>

              <div>
                <span>Female</span>
                <strong>{values.female}</strong>
              </div>
            </div>
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
            <h2>Monthly patients</h2>
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
