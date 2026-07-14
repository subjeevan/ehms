"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import PatientForm from "@/components/PatientForm";
import Loading from "@/components/Loading";
import Alert from "@/components/Alert";
import { patientApi } from "@/lib/api";

function PageBody() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    patientApi.get(id)
      .then((data) => setPatient({
        ...data,
        insuranceDetail: data.insuranceDetail || {
          provider: "",
          policyNumber: ""
        }
      }))
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!patient) return <Loading label="Loading patient..." />;

  const update = async (values) => {
    await patientApi.update(id, values);
    router.push("/patients?updated=1");
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Administrator update</span>
          <h1>Edit patient</h1>
          <p>Update patient ID {id}.</p>
        </div>
      </header>
      <PatientForm
        initialValues={patient}
        submitLabel="Save patient changes"
        onSubmit={update}
        onCancel={() => router.back()}
      />
    </div>
  );
}

export default function PatientEditPage() {
  return <AdminGuard><PageBody /></AdminGuard>;
}
