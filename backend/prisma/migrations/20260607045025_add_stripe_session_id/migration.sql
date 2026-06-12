-- AlterTable
ALTER TABLE "LicenseKey" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plan" TEXT,
ADD COLUMN     "stripeSessionId" TEXT;
