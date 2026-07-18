"use client";

import { useRouter } from "next/navigation";
import PatientRegistrationForm from "@/components/PatientRegistrationForm";
import { registrationApi } from "@/lib/api";

export default function PatientRegistrationPage() {
  const router = useRouter();

  const finish = (result) => {
    window.alert(
      `${result.message}\nMRN: ${result.patient.medicalRecordNumber}\nVisit ID: ${result.visit.id}`,
    );
    router.push("/patients?created=1");
  };

  const registerNew = async (payload) =>
    finish(await registrationApi.registerNew(payload));

  const registerReturning = async (payload) =>
    finish(await registrationApi.registerReturning(payload));

  return (
    <div className="registration-page">
      <PatientRegistrationForm
        onRegisterNew={registerNew}
        onRegisterReturning={registerReturning}
      />
    </div>
  );
}
