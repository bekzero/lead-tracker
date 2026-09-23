"use client";

import { FormEvent, useMemo, useState } from "react";
import { endpointRanges, interestChoices } from "@/lib/validation";

type FormStatus = "idle" | "submitting" | "success" | "error";

function TextField({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span>{label}{required && <em aria-hidden="true"> *</em>}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={type === "email" ? 254 : 160}
      />
    </label>
  );
}

export function LeadForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      idempotencyKey,
      fullName: data.get("fullName"),
      company: data.get("company"),
      workEmail: data.get("workEmail"),
      jobTitle: data.get("jobTitle"),
      phone: data.get("phone"),
      endpointRange: data.get("endpointRange"),
      currentPasswordManager: data.get("currentPasswordManager"),
      currentIdentityProvider: data.get("currentIdentityProvider"),
      interests: selectedInterests,
      demoRequested: data.get("demoRequested") === "on"
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "We couldn’t save your details.");
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We couldn’t save your details. Please try again.");
    }
  }

  function toggleInterest(value: string) {
    setSelectedInterests((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

  if (status === "success") {
    return (
      <section className="form-card success-card" aria-live="polite">
        <div className="success-icon" aria-hidden="true">✓</div>
        <p className="eyebrow">Details received</p>
        <h2>Thanks for stopping by.</h2>
        <p>The KZero team will follow up after the conference. We’re looking forward to continuing the conversation.</p>
      </section>
    );
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate={false}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">Stay in touch</p>
          <h2>Your details</h2>
        </div>
        <span className="required-note">* Required</span>
      </div>

      <div className="field-grid">
        <TextField label="Full name" name="fullName" required autoComplete="name" placeholder="Alex Morgan" />
        <TextField label="Company" name="company" required autoComplete="organization" placeholder="Company name" />
        <TextField label="Work email" name="workEmail" type="email" required autoComplete="email" placeholder="alex@company.com" />
        <TextField label="Job title" name="jobTitle" autoComplete="organization-title" placeholder="Optional" />
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" placeholder="Optional" />
      </div>

      <fieldset className="choice-group">
        <legend>Approximate number of endpoints <span>Optional</span></legend>
        <div className="chips">
          {endpointRanges.map((range) => (
            <label className="chip" key={range}>
              <input type="radio" name="endpointRange" value={range} />
              <span>{range}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field-grid">
        <TextField label="Current password manager" name="currentPasswordManager" placeholder="Optional" />
        <TextField label="Current SSO or identity provider" name="currentIdentityProvider" placeholder="Optional" />
      </div>

      <fieldset className="choice-group">
        <legend>What are you most interested in? <span>Choose any</span></legend>
        <div className="chips">
          {interestChoices.map((interest) => (
            <label className="chip" key={interest}>
              <input
                type="checkbox"
                value={interest}
                checked={selectedInterests.includes(interest)}
                onChange={() => toggleInterest(interest)}
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="demo-choice">
        <input type="checkbox" name="demoRequested" />
        <span>
          <strong>I’d like to book a KZero demo after the conference.</strong>
          <small>The team will contact you to arrange a suitable time.</small>
        </span>
      </label>

      {status === "error" && (
        <div className="error-message" role="alert">
          {message} Your entries are still here—please try again.
        </div>
      )}

      <button className="primary-button" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Saving securely…" : "Send my details"}
      </button>
      <p className="privacy-note">
        By submitting, you agree that KZero may use these details to follow up about your enquiry. We don’t ask for marketing consent here, and no optional choices are preselected.
      </p>
    </form>
  );
}
