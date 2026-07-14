"use client";

export default function PatientDetailModal({ patient, onClose }) {
  if (!patient) return null;

  return (
    <div className="modal-backdrop">
      <section className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Patient record</span>
            <h2>{patient.fullName}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <dl className="detail-grid">
          <div><dt>ID</dt><dd>{patient.id}</dd></div>
          <div><dt>Gender</dt><dd>{patient.gender}</dd></div>
          <div><dt>Date of birth</dt><dd>{patient.dateOfBirth}</dd></div>
          <div><dt>Contact</dt><dd>{patient.contactNumber}</dd></div>
          <div><dt>Patient type</dt><dd>{patient.patientType}</dd></div>
          <div><dt>Amount paid</dt><dd>¥{patient.amountPaid || 0}</dd></div>
          <div className="wide"><dt>Address</dt><dd>{patient.address}</dd></div>
        </dl>

        {patient.insuranceDetail && (
          <section className="insurance-summary">
            <h3>Insurance details</h3>
            <dl className="detail-grid">
              <div><dt>Provider</dt><dd>{patient.insuranceDetail.provider || "-"}</dd></div>
              <div><dt>Policy number</dt><dd>{patient.insuranceDetail.policyNumber || "-"}</dd></div>
            </dl>
          </section>
        )}

        <div className="modal-actions">
          <button className="button primary" onClick={onClose}>Close</button>
        </div>
      </section>
    </div>
  );
}
