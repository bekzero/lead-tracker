import type { Lead } from "@prisma/client";

function cell(value: unknown) {
  if (value === null || value === undefined) return "";
  const safe = String(value).replace(/"/g, '""');
  return `"${safe}"`;
}

export function leadsToCsv(leads: Lead[]) {
  const headings = [
    "Full Name",
    "Company",
    "Work Email",
    "Job Title",
    "Phone",
    "Approximate Endpoints",
    "Current Password Manager",
    "Current SSO or Identity Provider",
    "Interests",
    "Demo Requested",
    "Contacted",
    "Staff Notes",
    "Event Name",
    "Submitted At (UTC)"
  ];

  const rows = leads.map((lead) => [
    lead.fullName,
    lead.company,
    lead.workEmail,
    lead.jobTitle,
    lead.phone,
    lead.endpointRange,
    lead.currentPasswordManager,
    lead.currentIdentityProvider,
    lead.interests.join("; "),
    lead.demoRequested ? "Yes" : "No",
    lead.contacted ? "Yes" : "No",
    lead.staffNotes,
    lead.eventName,
    lead.submittedAt.toISOString()
  ]);

  return "\uFEFF" + [headings, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
}
