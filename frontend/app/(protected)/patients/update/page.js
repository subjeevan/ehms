"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";
import { patientApi } from "@/lib/api";

function PageBody() {
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const open = async (event) => {
    event.preventDefault();
    setError("");
    if (!id.trim()) {
      setError("Patient ID is required");
      return;
    }
    try {
      await patientApi.get(id.trim());
      router.push(`/patients/${id.trim()}/edit`);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="page-stack narrow-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Administrator tool</span>
          <h1>Patient information update</h1>
          <p>Locate a patient record by ID before editing.</p>
        </div>
      </header>
      <form className="card account-form" onSubmit={open}>
        {error && <Alert type="error">{error}</Alert>}
        <FormField
          label="Patient ID"
          name="patientId"
          value={id}
          onChange={(event) => setId(event.target.value)}
          required
        />
        <button className="button primary">Open patient record</button>
      </form>
    </div>
  );
}

export default function PatientUpdatePage() {
  return <AdminGuard><PageBody /></AdminGuard>;
}
