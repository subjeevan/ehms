"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/FormField";

const emptyContact = {
  fullName: "",
  email: "",
  contactNumber: "",
  subject: "",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactPattern = /^[0-9]{8,10}$/;

export default function ContactUsModal({ open, onClose }) {
  const [values, setValues] = useState(emptyContact);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(emptyContact);
    setErrors({});
    setSent(false);
  }, [open]);

  if (!open) return null;

  const change = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === "contactNumber"
        ? value.replace(/\D/g, "").slice(0, 10)
        : value;

    setValues((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const submit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = "Full name is required";
    }

    if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!contactPattern.test(values.contactNumber)) {
      nextErrors.contactNumber = "Contact number must contain 8 to 10 digits";
    }

    if (!values.subject.trim()) {
      nextErrors.subject = "Subject is required";
    }

    if (!values.message.trim()) {
      nextErrors.message = "Message is required";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="enhancement-modal-backdrop" role="presentation">
        <section
          className="enhancement-modal success-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mail-sent-title"
        >
          <div className="success-icon">✓</div>
          <h2 id="mail-sent-title">Mail sent</h2>
          <p>
            Thank you for contacting jacksoft.pvt.ltd. Your message has been
            accepted.
          </p>
          <button type="button" className="button primary" onClick={onClose}>
            Close
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="enhancement-modal-backdrop" role="presentation">
      <section
        className="enhancement-modal contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
      >
        <header className="enhancement-modal-header">
          <div>
            <span className="eyebrow">jacksoft.pvt.ltd</span>
            <h2 id="contact-title">Contact us</h2>
          </div>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close contact form"
          >
            ×
          </button>
        </header>

        <form onSubmit={submit} noValidate>
          <div className="form-grid">
            <FormField
              label="Full name"
              name="fullName"
              value={values.fullName}
              onChange={change}
              error={errors.fullName}
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={change}
              error={errors.email}
              required
            />
            <FormField
              label="Contact number"
              name="contactNumber"
              type="tel"
              inputMode="numeric"
              minLength={8}
              maxLength={10}
              value={values.contactNumber}
              onChange={change}
              error={errors.contactNumber}
              required
            />
            <FormField
              label="Subject"
              name="subject"
              value={values.subject}
              onChange={change}
              error={errors.subject}
              required
            />
          </div>

          <FormField
            label="Message"
            name="message"
            value={values.message}
            onChange={change}
            error={errors.message}
            textarea
            rows={5}
            required
          />

          <div className="form-actions">
            <button type="submit" className="button primary">
              Submit
            </button>
            <button type="button" className="button secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
