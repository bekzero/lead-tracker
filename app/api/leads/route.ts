import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getEventName } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = leadSchema.safeParse(await request.json());
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Please check the form and try again.";
      return NextResponse.json({ message: issue }, { status: 400 });
    }

    const { idempotencyKey, comments, ...lead } = parsed.data;
    await prisma.lead.create({
      data: {
        ...lead,
        workEmail: lead.workEmail.toLowerCase(),
        idempotencyKey,
        staffNotes: comments,
        eventName: getEventName()
      }
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    console.error("Lead submission failed", error);
    return NextResponse.json(
      { message: "We couldn’t save your details right now. Please try again." },
      { status: 500 }
    );
  }
}
