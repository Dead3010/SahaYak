-- CreateTable
CREATE TABLE "Team" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "category"  TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_category_key" ON "Team"("category");

-- AlterTable
ALTER TABLE "User" ADD COLUMN "teamId" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "teamId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
