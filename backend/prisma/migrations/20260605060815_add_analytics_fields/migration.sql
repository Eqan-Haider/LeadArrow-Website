-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "routingMethod" TEXT NOT NULL DEFAULT 'ROUND_ROBIN',
    "roundRobinPointer" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseKey" (
    "id" TEXT NOT NULL,
    "keyString" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "prospectName" TEXT NOT NULL,
    "leadSource" TEXT NOT NULL,
    "crmLeadId" TEXT,
    "crmRecordUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ROUTING',
    "firstAlertedAt" TIMESTAMP(3),
    "firstAnsweredAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "acceptedVia" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routing_attempts" (
    "id" TEXT NOT NULL,
    "leadLogId" TEXT NOT NULL,
    "userId" TEXT,
    "attemptOrder" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RINGING',
    "callControlId" TEXT,
    "callStartAt" TIMESTAMP(3),
    "answerAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "channel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routing_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rep_availability_slots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',

    CONSTRAINT "rep_availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LicenseKey_keyString_key" ON "LicenseKey"("keyString");

-- AddForeignKey
ALTER TABLE "LicenseKey" ADD CONSTRAINT "LicenseKey_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_logs" ADD CONSTRAINT "lead_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routing_attempts" ADD CONSTRAINT "routing_attempts_leadLogId_fkey" FOREIGN KEY ("leadLogId") REFERENCES "lead_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routing_attempts" ADD CONSTRAINT "routing_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rep_availability_slots" ADD CONSTRAINT "rep_availability_slots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
