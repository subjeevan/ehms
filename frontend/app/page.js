"use client";

import Link from "next/link";
import { useState } from "react";
import ContactUsModal from "@/components/ContactUsModal";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const [contactOpen, setContactOpen] = useState(false);
  const { ready, isAuthenticated } = useAuth();

  return (
    <main className="public-home">
      <header className="public-home-header">
        <div className="public-brand">
          <span className="public-brand-mark">J</span>
          <div>
            <strong>Project By Jeevan Subedi</strong>
            <small>M25W7486</small>
          </div>
        </div>

        <div className="public-home-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => setContactOpen(true)}
          >
            Contact us
          </button>

          <Link
            className="button primary"
            href={ready && isAuthenticated ? "/dashboard" : "/login"}
          >
            {ready && isAuthenticated ? "Open dashboard" : "Sign in"}
          </Link>
        </div>
      </header>

      <section className="public-home-hero">
        <div className="public-home-copy">
          <span className="eyebrow">Hospital Management system</span>
          <h1>Patient registration and management in one place</h1>
          <p>
            It provides patient registration, billing, departments,
            doctors, role-based users, dashboards, charts and operational
            reporting through a Kotlin Spring Boot and Next.js application.
          </p>

          <div className="public-home-cta">
            <Link
              className="button primary"
              href={ready && isAuthenticated ? "/dashboard" : "/login"}
            >
              {ready && isAuthenticated ? "Continue to HMS" : "Login to HMS"}
            </Link>
            <button
              type="button"
              className="button secondary"
              onClick={() => setContactOpen(true)}
            >
              Have a query? Contact us
            </button>
          </div>
        </div>

        <div className="public-home-panel card">
          <span className="eyebrow">Developed by</span>
          <h2>Jeevan Subedi (M25W7486)</h2>
          <p>
            Practical web systems for healthcare administration and patient
            service workflows.
          </p>
          <ul>
            <li>Secure role-based access</li>
            <li>Responsive patient operations</li>
            <li>REST API integration</li>
            <li>Dashboard and reporting</li>
          </ul>
        </div>
      </section>

      <footer className="public-home-footer">
        <span>© 2026 jacksoft.pvt.ltd</span>
        <button type="button" onClick={() => setContactOpen(true)}>
          Contact us
        </button>
      </footer>

      <ContactUsModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </main>
  );
}
