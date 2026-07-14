import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <section className="center-card">
      <span className="error-code">403</span>
      <h1>Access denied</h1>
      <p className="muted">Administrator permission is required for this page.</p>
      <Link className="button primary" href="/dashboard">Return to dashboard</Link>
    </section>
  );
}
