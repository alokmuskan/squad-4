-- CreateTable
CREATE TABLE "VectorDocument" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VectorDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillGapSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillGapSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "duration" TEXT,
    "reason" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VectorDocument_source_idx" ON "VectorDocument"("source");

-- CreateIndex
CREATE INDEX "ResourceRecommendation_userId_skill_idx" ON "ResourceRecommendation"("userId", "skill");

-- AddForeignKey
ALTER TABLE "SkillGapSnapshot" ADD CONSTRAINT "SkillGapSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRecommendation" ADD CONSTRAINT "ResourceRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
