import Image from "next/image";
import { redirect } from "next/navigation";
import { TeamDashboard } from "@/components/TeamDashboard";
import { isTeamAuthenticated } from "@/lib/auth";
import { getEventName } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  if (!(await isTeamAuthenticated())) redirect("/team/login");

  const leads = await prisma.lead.findMany({
    orderBy: [{ demoRequested: "desc" }, { submittedAt: "desc" }]
  });

  return (
    <main className="team-shell" lang="en">
      <div className="team-wrap">
        <header className="team-header">
          <div>
            <Image
              className="team-logo"
              src="/brand/kzero-passwordless-horizontal.png"
              width={3361}
              height={1419}
              alt="KZero Passwordless"
              priority
            />
            <p className="eyebrow">KZero lead desk</p>
            <h1>Conference leads</h1>
            <p className="team-subtitle">{getEventName()} · Demo requests are shown first.</p>
          </div>
          <div className="header-actions">
            <a className="secondary-button" href="/api/team/export">Export CSV</a>
            <form action="/api/team/logout" method="post">
              <button className="secondary-button" type="submit">Sign out</button>
            </form>
          </div>
        </header>
        <TeamDashboard
          initialLeads={leads.map((lead) => ({
            ...lead,
            submittedAt: lead.submittedAt.toISOString(),
            contactedAt: lead.contactedAt?.toISOString() || null,
            updatedAt: lead.updatedAt.toISOString()
          }))}
        />
      </div>
    </main>
  );
}
