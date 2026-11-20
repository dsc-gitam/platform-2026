-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'CORE', 'DOCS', 'ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TeamKind" AS ENUM ('ORGANIZER', 'CORE', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'PAST');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('MEMBER', 'VOLUNTEER', 'CORE', 'SPEAKER', 'SESSION', 'STORY');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "photoData" BYTEA,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "regNo" TEXT,
    "branch" TEXT,
    "year" TEXT,
    "bio" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "interests" TEXT[],
    "fcmTokens" TEXT[],
    "teamKind" "TeamKind",
    "teamTitle" TEXT,
    "teamBlurb" TEXT,
    "teamColor" TEXT,
    "showOnSite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "endTime" TEXT,
    "venue" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 100,
    "free" BOOLEAN NOT NULL DEFAULT true,
    "blurb" TEXT NOT NULL,
    "tags" TEXT[],
    "speakers" JSONB NOT NULL DEFAULT '[]',
    "questions" JSONB NOT NULL DEFAULT '[]',
    "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "ready" BOOLEAN NOT NULL DEFAULT false,
    "details" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "ticketCode" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointAward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "awardedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exploration" (
    "userId" TEXT NOT NULL,
    "atlas" JSONB NOT NULL DEFAULT '{}',
    "quiz" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exploration_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "type" "ApplicationType" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "files" TEXT[],
    "commitSha" TEXT,
    "ok" BOOLEAN NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_ticketCode_key" ON "Registration"("ticketCode");

-- CreateIndex
CREATE INDEX "Registration_eventId_idx" ON "Registration"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_userId_eventId_key" ON "Registration"("userId", "eventId");

-- CreateIndex
CREATE INDEX "PointAward_userId_idx" ON "PointAward"("userId");

-- CreateIndex
CREATE INDEX "PointAward_eventId_idx" ON "PointAward"("eventId");

-- CreateIndex
CREATE INDEX "Application_type_status_idx" ON "Application"("type", "status");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAward" ADD CONSTRAINT "PointAward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAward" ADD CONSTRAINT "PointAward_awardedById_fkey" FOREIGN KEY ("awardedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAward" ADD CONSTRAINT "PointAward_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exploration" ADD CONSTRAINT "Exploration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
