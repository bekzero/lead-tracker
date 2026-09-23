"use client";

import { useMemo, useState } from "react";

type TeamLead = {
  id: string;
  fullName: string;
  company: string;
  workEmail: string;
  jobTitle: string | null;
  phone: string | null;
  endpointRange: string | null;
  currentPasswordManager: string | null;
  currentIdentityProvider: string | null;
  interests: string[];
  demoRequested: boolean;
  eventName: string;
  submittedAt: string;
  contacted: boolean;
  contactedAt: string | null;
  staffNotes: string | null;
  updatedAt: string;
  idempotencyKey: string;
};

export function TeamDashboard({ initialLeads }: { initialLeads: TeamLead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((lead) =>
      [lead.fullName, lead.company, lead.workEmail, lead.jobTitle, lead.interests.join(" ")]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [leads, query]);

  async function updateLead(id: string, body: object) {
    setSavingId(id);
    setSaveMessage((current) => ({ ...current, [id]: "Saving…" }));
    try {
      const response = await fetch(`/api/team/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error();
      const updated = (await response.json()) as TeamLead;
      setLeads((current) => current.map((lead) => (lead.id === id ? updated : lead)));
      setSaveMessage((current) => ({ ...current, [id]: "Saved" }));
    } catch {
      setSaveMessage((current) => ({ ...current, [id]: "Couldn’t save—retry" }));
    } finally {
      setSavingId(null);
    }
  }

  function setLocalNotes(id: string, notes: string) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, staffNotes: notes } : lead)));
    setSaveMessage((current) => ({ ...current, [id]: "Unsaved" }));
  }

  const demoCount = leads.filter((lead) => lead.demoRequested).length;
  const openCount = leads.filter((lead) => !lead.contacted).length;

  return (
    <>
      <div className="dashboard-bar">
        <input
          className="search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, company, email, title, or interest…"
          aria-label="Search leads"
        />
        <div className="stats" aria-label="Lead summary">
          <div className="stat"><strong>{leads.length}</strong><span>Total leads</span></div>
          <div className="stat"><strong>{demoCount}</strong><span>Demo requests</span></div>
          <div className="stat"><strong>{openCount}</strong><span>Not contacted</span></div>
        </div>
      </div>

      <section className="lead-list" aria-live="polite">
        {filtered.length === 0 ? (
          <div className="empty-state">{leads.length ? "No leads match your search." : "No leads yet. New submissions will appear here."}</div>
        ) : filtered.map((lead) => (
          <article className={`lead-card${lead.demoRequested ? " demo" : ""}`} key={lead.id}>
            <div>
              <h2 className="lead-name">{lead.fullName}</h2>
              <p className="lead-meta">{lead.jobTitle ? `${lead.jobTitle} · ` : ""}{lead.company}</p>
              <a className="lead-email" href={`mailto:${lead.workEmail}`}>{lead.workEmail}</a>
              {lead.phone && <p className="lead-detail">{lead.phone}</p>}
              <div className="badge-row">
                {lead.demoRequested && <span className="badge demo-badge">Demo requested</span>}
                <span className="badge">{lead.contacted ? "Contacted" : "Not contacted"}</span>
              </div>
            </div>
            <div>
              <p className="lead-detail"><strong>Submitted:</strong> {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(lead.submittedAt))}</p>
              <p className="lead-detail"><strong>Event:</strong> {lead.eventName}</p>
              {lead.endpointRange && <p className="lead-detail"><strong>Endpoints:</strong> {lead.endpointRange}</p>}
              {lead.currentPasswordManager && <p className="lead-detail"><strong>Password manager:</strong> {lead.currentPasswordManager}</p>}
              {lead.currentIdentityProvider && <p className="lead-detail"><strong>SSO / IdP:</strong> {lead.currentIdentityProvider}</p>}
              {lead.interests.length > 0 && (
                <div className="badge-row">{lead.interests.map((interest) => <span className="badge" key={interest}>{interest}</span>)}</div>
              )}
            </div>
            <div>
              <label className="contact-toggle">
                <input
                  type="checkbox"
                  checked={lead.contacted}
                  disabled={savingId === lead.id}
                  onChange={(event) => updateLead(lead.id, { action: "contacted", contacted: event.target.checked })}
                />
                Contacted by the team
              </label>
              <textarea
                className="notes-area"
                aria-label={`Staff notes for ${lead.fullName}`}
                placeholder="Add private staff notes…"
                maxLength={2000}
                value={lead.staffNotes || ""}
                onChange={(event) => setLocalNotes(lead.id, event.target.value)}
              />
              <div className="notes-actions">
                <span className="save-state">{saveMessage[lead.id]}</span>
                <button
                  className="small-button"
                  type="button"
                  disabled={savingId === lead.id}
                  onClick={() => updateLead(lead.id, { action: "notes", notes: lead.staffNotes || "" })}
                >Save notes</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
