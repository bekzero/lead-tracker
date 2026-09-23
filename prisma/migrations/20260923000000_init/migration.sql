-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "workEmail" TEXT NOT NULL,
    "jobTitle" TEXT,
    "phone" TEXT,
    "endpointRange" TEXT,
    "currentPasswordManager" TEXT,
    "currentIdentityProvider" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "demoRequested" BOOLEAN NOT NULL DEFAULT false,
    "eventName" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "contactedAt" TIMESTAMP(3),
    "staffNotes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lead_idempotencyKey_key" ON "Lead"("idempotencyKey");
CREATE INDEX "Lead_eventName_submittedAt_idx" ON "Lead"("eventName", "submittedAt");
CREATE INDEX "Lead_demoRequested_submittedAt_idx" ON "Lead"("demoRequested", "submittedAt");
CREATE INDEX "Lead_workEmail_idx" ON "Lead"("workEmail");
