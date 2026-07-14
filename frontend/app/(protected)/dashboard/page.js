"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { dashboardApi } from "@/lib/api";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const emptySummary = {
  totalPatients: 0,
  generalPatients: 0,
  payingPatients: 0,
  insurancePatients: 0,
  malePatients: 0,
  femalePatients: 0,
  monthlyRegistrations: []
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(emptySummary);
  const [earnings, setEarnings] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([dashboardApi.summary(), dashboardApi.earnings()])
      .then(([summaryResult, earningsResult]) => {
        if (!active) return;
        if (summaryResult.status === "fulfilled") {
          setSummary({ ...emptySummary, ...summaryResult.value });
        } else {
          setError(summaryResult.reason.message);
        }
        if (earningsResult.status === "fulfilled") {
          setEarnings(earningsResult.value);
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const chartData = useMemo(() => {
    const rows = summary.monthlyRegistrations || [];
    return {
      labels: rows.map((item) => item.month || item.label),
      datasets: [{
        label: "Patient registrations",
        data: rows.map((item) => item.count || item.total || 0),
        backgroundColor: "rgba(15, 107, 120, .78)",
        borderRadius: 7
      }]
    };
  }, [summary]);

  if (loading) return <Loading label="Loading dashboard..." />;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Operations overview</span>
          <h1>Dashboard</h1>
          <p>Live patient and registration summary.</p>
        </div>
        <span className="live-pill"><span /> Live data</span>
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

      <section className="summary-grid">
        {[
          ["Paying patients", summary.payingPatients, "paying"],
          ["Insurance patients", summary.insurancePatients, "insurance"],
          ["General patients", summary.generalPatients, "general"]
        ].map(([label, count, type]) => (
          <article className={`card summary-card ${type}`} key={label}>
            <div className="summary-card-top">
              <span className="muted">{label}</span>
              <strong>{count}</strong>
            </div>
            <div className="gender-split">
              <div><span>Male</span><strong>{summary.malePatients || 0}</strong></div>
              <div><span>Female</span><strong>{summary.femalePatients || 0}</strong></div>
            </div>
          </article>
        ))}
      </section>

      {earnings && (
        <section className="earnings-grid">
          <article className="card earnings-card total-earnings">
            <span className="eyebrow">Revenue</span>
            <h2>Total earnings</h2>
            <div className="earnings-total">
              <strong>¥{earnings.totalEarnings || 0}</strong>
            </div>
          </article>
          <article className="card earnings-card">
            <span className="eyebrow">Today</span>
            <h2>Daily earnings</h2>
            <div className="earnings-total"><strong>¥{earnings.todayEarnings || 0}</strong></div>
          </article>
          <article className="card earnings-card">
            <span className="eyebrow">Month</span>
            <h2>Monthly earnings</h2>
            <div className="earnings-total"><strong>¥{earnings.monthEarnings || 0}</strong></div>
          </article>
        </section>
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
              plugins: { legend: { display: false } }
            }}
          />
        </div>
      </section>
    </div>
  );
}
