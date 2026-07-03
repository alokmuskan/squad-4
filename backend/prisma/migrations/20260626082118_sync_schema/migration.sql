/*
  Warnings:

  - A unique constraint covering the columns `[providerId,accountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" DROP NOT NULL;

-- CreateTable
CREATE TABLE "UserOutcome" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "companyId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "careerGoal" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "requiredSkills" JSONB NOT NULL,
    "niceToHaveSkills" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketProfile" (
    "id" TEXT NOT NULL,
    "careerGoal" TEXT NOT NULL,
    "weightedSkills" JSONB NOT NULL,
    "topCompanies" TEXT[],
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "MarketProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserOutcome_userId_goal_idx" ON "UserOutcome"("userId", "goal");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE INDEX "JobPosting_careerGoal_idx" ON "JobPosting"("careerGoal");

-- CreateIndex
CREATE UNIQUE INDEX "MarketProfile_careerGoal_key" ON "MarketProfile"("careerGoal");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- AddForeignKey
ALTER TABLE "UserOutcome" ADD CONSTRAINT "UserOutcome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOutcome" ADD CONSTRAINT "UserOutcome_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
