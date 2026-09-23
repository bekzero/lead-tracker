"use client";

import { FormEvent, useMemo, useState } from "react";
import { publicCopy, type PublicLanguage } from "@/lib/public-copy";
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

export function LeadForm({ language }: { language: PublicLanguage }) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const copy = publicCopy[language];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

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
      comments: data.get("comments"),
      demoRequested: data.get("demoRequested") === "on"
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await response.json();
      if (!response.ok) throw new Error(copy.submitError);
      setStatus("success");
    } catch {
      setStatus("error");
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
        <p className="eyebrow">{copy.received}</p>
        <h2>{copy.thankYou}</h2>
        <p>{copy.confirmation}</p>
      </section>
    );
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate={false}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">{copy.stayInTouch}</p>
          <h2>{copy.yourDetails}</h2>
        </div>
        <span className="required-note">* {copy.required}</span>
      </div>

      <div className="field-grid">
        <TextField label={copy.fullName} name="fullName" required autoComplete="name" placeholder={copy.fullNamePlaceholder} />
        <TextField label={copy.company} name="company" required autoComplete="organization" placeholder={copy.companyPlaceholder} />
        <TextField label={copy.workEmail} name="workEmail" type="email" required autoComplete="email" placeholder={copy.emailPlaceholder} />
        <TextField label={copy.jobTitle} name="jobTitle" autoComplete="organization-title" placeholder={copy.optional} />
        <TextField label={copy.phone} name="phone" type="tel" autoComplete="tel" placeholder={copy.optional} />
      </div>

      <fieldset className="choice-group">
        <legend>{copy.endpoints} <span>{copy.optional}</span></legend>
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
        <TextField label={copy.passwordManager} name="currentPasswordManager" placeholder={copy.optional} />
        <TextField label={copy.identityProvider} name="currentIdentityProvider" placeholder={copy.optional} />
      </div>

      <fieldset className="choice-group">
        <legend>{copy.interests} <span>{copy.chooseAny}</span></legend>
        <div className="chips">
          {interestChoices.map((interest) => (
            <label className="chip" key={interest}>
              <input
                type="checkbox"
                value={interest}
                checked={selectedInterests.includes(interest)}
                onChange={() => toggleInterest(interest)}
              />
              <span>{copy.interestLabels[interest]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>{copy.comments} <small>{copy.optional}</small></span>
        <textarea
          className="attendee-notes"
          name="comments"
          maxLength={1000}
          rows={3}
          placeholder={copy.commentsPlaceholder}
        />
      </label>

      <label className="demo-choice">
        <input type="checkbox" name="demoRequested" />
        <span>
          <strong>{copy.demoRequest}</strong>
          <small>{copy.demoFollowUp}</small>
        </span>
      </label>

      {status === "error" && (
        <div className="error-message" role="alert">
          {copy.submitError} {copy.retry}
        </div>
      )}

      <button className="primary-button" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? copy.submitting : copy.submit}
      </button>
      <p className="privacy-note">{copy.privacy}</p>
    </form>
  );
}
