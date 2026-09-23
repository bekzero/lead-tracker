import { NextResponse } from "next/server";
import { isTeamAuthenticated } from "@/lib/auth";
import { leadsToCsv } from "@/lib/csv";
import { getEventName } from "@/lib/config";
import { prisma } from "@/lib/prisma";

function filenamePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event";
}

export async function GET() {
  if (!(await isTeamAuthenticated())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const leads = await prisma.lead.findMany({ orderBy: [{ demoRequested: "desc" }, { submittedAt: "desc" }] });
  const csv = leadsToCsv(leads);
  const filename = `kzero-leads-${filenamePart(getEventName())}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}
