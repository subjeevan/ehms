"use client";

import { useRouter } from "next/navigation";
import PatientForm from "@/components/PatientForm";
import { patientApi } from "@/lib/api";
import { emptyPatient } from "@/utils/patientValidation";

export default function PatientRegistrationPage() {
  const router = useRouter();

  const create = async (values) => {
    await patientApi.createWithBilling(values);
    router.push("/patients?created=1");
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Clinical intake</span>
          <h1>Patient registration</h1>
          <p>Create a patient record and registration billing entry.</p>
        </div>
      </header>
      <PatientForm
        initialValues={emptyPatient}
        submitLabel="Register patient"
        onSubmit={create}
      />
    </div>
  );
}
