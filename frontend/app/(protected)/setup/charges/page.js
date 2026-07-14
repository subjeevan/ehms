"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";
import Loading from "@/components/Loading";
import { chargeApi } from "@/lib/api";

const types = ["GENERAL", "PAYING", "INSURANCE"];

function PageBody() {
  const [charges, setCharges] = useState([]);
  const [selected, setSelected] = useState("GENERAL");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await chargeApi.list();
      setCharges(Array.isArray(data) ? data : data.content || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const found = charges.find((item) => item.patientType === selected);
    setAmount(found?.amount ?? "");
  }, [selected, charges]);

  const save = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await chargeApi.update(selected, { amount: Number(amount) });
      setMessage(`${selected} charge updated successfully.`);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (loading && !charges.length) return <Loading label="Loading charges..." />;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Billing configuration</span>
          <h1>Charge setup</h1>
          <p>Configure registration charges for each patient type.</p>
        </div>
      </header>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <section className="setup-grid">
        <form className="card setup-form" onSubmit={save}>
          <FormField
            label="Patient type"
            name="patientType"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            options={types}
            required
          />
          <FormField
            label="Registration charge (¥)"
            name="amount"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            min="0"
            step="1"
            required
          />
          <button className="button primary">Save charge</button>
        </form>

        <section className="card setup-list">
          <div className="section-heading">
            <div><span className="eyebrow">Current values</span><h2>Patient charges</h2></div>
          </div>
          <div className="stack-list">
            {types.map((type) => {
              const charge = charges.find((item) => item.patientType === type);
              return (
                <article key={type}>
                  <div><strong>{type}</strong><p>Registration billing amount</p></div>
                  <strong>¥{charge?.amount || 0}</strong>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </div>
  );
}

export default function ChargeSetupPage() {
  return <AdminGuard><PageBody /></AdminGuard>;
}
