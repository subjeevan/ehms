"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  exportVisitsToExcel,
  patientApi,
  visitApi,
} from "@/lib/api";
import useDebounce from "@/hooks/useDebounce";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import ConfirmModal from "@/components/ConfirmModal";
import PatientDetailModal from "@/components/PatientDetailModal";
import { useAuth } from "@/context/AuthContext";

function categoryLabel(status) {
  return status === "RETURNING" ? "Follow-up" : "New";
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatMoney(value) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function PatientListPage() {
  const { isAdmin } = useAuth();
  const [createdMessage, setCreatedMessage] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState("visitDate");
  const [sortDir, setSortDir] = useState("desc");
  const [result, setResult] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await visitApi.list({
        page,
        size,
        search: debouncedSearch,
        sortBy,
        sortDir,
      });
      setResult(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedSearch, sortBy, sortDir]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCreatedMessage(Boolean(params.get("created") || params.get("updated")));
  }, []);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, size]);

  const sort = (field) => {
    if (sortBy === field) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const viewPatient = async (visit) => {
    setViewing(true);
    setError("");

    try {
      setSelected(await patientApi.get(visit.patientId));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setViewing(false);
    }
  };

  const exportAll = async () => {
    setExporting(true);
    setError("");

    try {
      const rows = await visitApi.export({
        search: debouncedSearch,
        sortBy,
        sortDir,
      });
      await exportVisitsToExcel(rows);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setExporting(false);
    }
  };

  const remove = async () => {
    setDeleting(true);

    try {
      await patientApi.remove(deleteTarget.patientId);
      setDeleteTarget(null);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Visit confirmation records</span>
          <h1>Patient visit list</h1>
          <p>
            Every registration visit is shown separately by visit date, including
            New or Follow-up status and the user who registered it.
          </p>
        </div>
        <Link href="/patients/register" className="button primary">
          + Register patient
        </Link>
      </header>

      {createdMessage && (
        <Alert type="success">
          Patient or follow-up visit information saved successfully.
        </Alert>
      )}

      {error && (
        <Alert type="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <section className="card table-card">
        <div className="table-toolbar">
          <label className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search visit date, patient ID, MRN, mobile, insurance, doctor, department, or registrar"
            />
          </label>

          <div className="row-actions">
            <button
              className="button secondary"
              type="button"
              onClick={exportAll}
              disabled={exporting || !result.totalElements}
            >
              {exporting ? "Exporting..." : "Export all filtered visits"}
            </button>

            <label className="page-size">
              Rows
              <select
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
              >
                {[10, 20, 50].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>
                  <button className="sort-button" onClick={() => sort("visitDate")}>
                    Visit date
                  </button>
                </th>
                <th>
                  <button className="sort-button" onClick={() => sort("id")}>
                    Visit ID
                  </button>
                </th>
                <th>
                  <button className="sort-button" onClick={() => sort("patientId")}>
                    Patient ID / MRN
                  </button>
                </th>
                <th>
                  <button className="sort-button" onClick={() => sort("patientName")}>
                    Patient
                  </button>
                </th>
                <th>Gender / Mobile</th>
                <th>
                  <button className="sort-button" onClick={() => sort("patientStatus")}>
                    Visit category
                  </button>
                </th>
                <th>
                  <button className="sort-button" onClick={() => sort("patientType")}>
                    Patient type
                  </button>
                </th>
                <th>Department / Doctor</th>
                <th>Insurance number</th>
                <th>
                  <button className="sort-button" onClick={() => sort("registeredBy")}>
                    Registered by
                  </button>
                </th>
                <th>Billing</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading && !result.content.length && (
                <tr>
                  <td colSpan="12" className="empty-cell">
                    No visit records found.
                  </td>
                </tr>
              )}

              {result.content.map((visit) => (
                <tr key={visit.visitId}>
                  <td>
                    <strong>{formatDate(visit.visitDate)}</strong>
                    <small>{formatDateTime(visit.registeredAt)}</small>
                  </td>
                  <td>{visit.visitId}</td>
                  <td>
                    <strong>#{visit.patientId}</strong>
                    <small>{visit.medicalRecordNumber}</small>
                  </td>
                  <td>
                    <strong>{visit.fullName}</strong>
                    <small>DOB: {visit.dateOfBirth}</small>
                  </td>
                  <td>
                    {visit.gender}
                    <small>{visit.contactNumber}</small>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        visit.patientStatus === "RETURNING"
                          ? "type-insurance"
                          : "type-general"
                      }`}
                    >
                      {categoryLabel(visit.patientStatus)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge type-${visit.patientType?.toLowerCase()}`}>
                      {visit.patientType}
                    </span>
                  </td>
                  <td>
                    <strong>{visit.departmentName}</strong>
                    <small>{visit.doctorName}</small>
                  </td>
                  <td>{visit.insuranceNumber || "-"}</td>
                  <td>
                    <strong>{visit.registeredBy}</strong>
                    <small>{visit.reasonForVisit || "No reason entered"}</small>
                  </td>
                  <td>
                    <strong>{formatMoney(visit.billedAmount)}</strong>
                    <small>
                      Bills: {visit.billIds?.join(", ") || "-"} · Paid: {formatMoney(visit.paidAmount)} · {visit.billingStatus}
                    </small>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="text-button"
                        onClick={() => viewPatient(visit)}
                        disabled={viewing}
                      >
                        View patient
                      </button>

                      {isAdmin && (
                        <Link
                          className="text-button"
                          href={`/patients/${visit.patientId}/edit`}
                        >
                          Edit
                        </Link>
                      )}

                      {isAdmin && (
                        <button
                          className="text-button danger-text"
                          onClick={() => setDeleteTarget(visit)}
                        >
                          Delete patient
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="table-loading-overlay">
            <Loading label="Loading patient visits..." />
          </div>
        )}

        <div className="table-footer">
          <span>{result.totalElements || 0} visit records</span>
          <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
        </div>
      </section>

      <PatientDetailModal patient={selected} onClose={() => setSelected(null)} />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete patient"
        message={`Delete ${deleteTarget?.fullName || "this patient"}? All of this patient's visits and bills will also be deleted.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </div>
  );
}
