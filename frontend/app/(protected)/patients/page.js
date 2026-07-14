"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  exportPatientsToExcel,
  patientApi
} from "@/lib/api";
import useDebounce from "@/hooks/useDebounce";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import ConfirmModal from "@/components/ConfirmModal";
import PatientDetailModal from "@/components/PatientDetailModal";
import { useAuth } from "@/context/AuthContext";

export default function PatientListPage() {
  const [createdMessage, setCreatedMessage] = useState(false);
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState("registeredAt");
  const [sortDir, setSortDir] = useState("desc");
  const [result, setResult] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await patientApi.list({
        page,
        size,
        search: debouncedSearch,
        sortBy,
        sortDir
      });
      setResult(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedSearch, sortBy, sortDir]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCreatedMessage(Boolean(params.get("created") || params.get("updated")));
  }, []);
  useEffect(() => { setPage(0); }, [debouncedSearch, size]);

  const sort = (field) => {
    if (sortBy === field) {
      setSortDir((current) => current === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await patientApi.remove(deleteTarget.id);
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
          <span className="eyebrow">Patient records</span>
          <h1>Patient list</h1>
          <p>Search, sort, review, update, and export patient information.</p>
        </div>
        <Link href="/patients/register" className="button primary">+ Register patient</Link>
      </header>

      {createdMessage && (
        <Alert type="success">Patient information saved successfully.</Alert>
      )}
      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}

      <section className="card table-card">
        <div className="table-toolbar">
          <label className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by patient name, contact, or ID"
            />
          </label>
          <div className="row-actions">
            <button
              className="button secondary"
              type="button"
              onClick={() => exportPatientsToExcel(result.content)}
              disabled={!result.content.length}
            >
              Export Excel
            </button>
            <label className="page-size">
              Rows
              <select value={size} onChange={(event) => setSize(Number(event.target.value))}>
                {[10, 20, 50].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th><button className="sort-button" onClick={() => sort("id")}>ID</button></th>
                <th><button className="sort-button" onClick={() => sort("fullName")}>Patient</button></th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Amount</th>
                <th><button className="sort-button" onClick={() => sort("registeredAt")}>Registered</button></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !result.content.length && (
                <tr><td colSpan="8" className="empty-cell">No patient records found.</td></tr>
              )}
              {result.content.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td><strong>{patient.fullName}</strong><small>{patient.dateOfBirth}</small></td>
                  <td>{patient.gender}</td>
                  <td>{patient.contactNumber}</td>
                  <td><span className={`badge type-${patient.patientType?.toLowerCase()}`}>{patient.patientType}</span></td>
                  <td>¥{patient.amountPaid || 0}</td>
                  <td>{patient.registeredAt ? new Date(patient.registeredAt).toLocaleDateString() : "-"}</td>
                  <td>
                    <div className="row-actions">
                      <button className="text-button" onClick={() => setSelected(patient)}>View</button>
                      {isAdmin && <Link className="text-button" href={`/patients/${patient.id}/edit`}>Edit</Link>}
                      {isAdmin && <button className="text-button danger-text" onClick={() => setDeleteTarget(patient)}>Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <div className="table-loading-overlay"><Loading label="Loading patients..." /></div>}

        <div className="table-footer">
          <span>{result.totalElements || 0} patient records</span>
          <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
        </div>
      </section>

      <PatientDetailModal patient={selected} onClose={() => setSelected(null)} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete patient"
        message={`Delete ${deleteTarget?.fullName || "this patient"}? This action cannot be undone.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </div>
  );
}
