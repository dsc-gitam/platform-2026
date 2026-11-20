-- AlterTable
ALTER TABLE "User" ADD COLUMN     "guestEmail" TEXT,
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_guestEmail_idx" ON "User"("guestEmail");
