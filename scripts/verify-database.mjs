import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class VerificationComplete extends Error {}

try {
  await prisma.$transaction(async (transaction) => {
    const idempotencyKey = randomUUID();

    const created = await transaction.lead.create({
      data: {
        idempotencyKey,
        fullName: "KZero deployment verification",
        company: "KZero",
        workEmail: "deployment-check@example.invalid",
        interests: [],
        demoRequested: false,
        eventName: process.env.EVENT_NAME
      }
    });

    const stored = await transaction.lead.findUnique({
      where: { idempotencyKey }
    });

    if (!stored || stored.id !== created.id) {
      throw new Error("The verification lead could not be read back after insertion.");
    }

    // Throwing rolls the transaction back, ensuring the verification row never persists.
    throw new VerificationComplete();
  });

  throw new Error("Database verification unexpectedly committed its test transaction.");
} catch (error) {
  if (error instanceof VerificationComplete) {
    console.log("Database write/read verification passed; the test lead was rolled back.");
  } else {
    console.error("Database write/read verification failed.", error);
    process.exitCode = 1;
  }
} finally {
  await prisma.$disconnect();
}
