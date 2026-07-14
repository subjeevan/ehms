import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="center-page">
      <section className="center-card">
        <span className="error-code">404</span>
        <h1>Page not found</h1>
        <p className="muted">The requested HMS page does not exist.</p>
        <Link className="button primary" href="/dashboard">Return to dashboard</Link>
      </section>
    </main>
  );
}
