import { NextResponse } from "next/server";
import { isTeamAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teamUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isTeamAuthenticated())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const parsed = teamUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Invalid update" }, { status: 400 });

  const { id } = await context.params;
  const data = parsed.data.action === "contacted"
    ? { contacted: parsed.data.contacted, contactedAt: parsed.data.contacted ? new Date() : null }
    : { staffNotes: parsed.data.notes || null };

  try {
    const lead = await prisma.lead.update({ where: { id }, data });
    return NextResponse.json({
      ...lead,
      submittedAt: lead.submittedAt.toISOString(),
      contactedAt: lead.contactedAt?.toISOString() || null,
      updatedAt: lead.updatedAt.toISOString()
    });
  } catch {
    return NextResponse.json({ message: "Lead not found" }, { status: 404 });
  }
}
