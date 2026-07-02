-- CreateEnum
CREATE TYPE "TicketSource" AS ENUM ('EMAIL', 'MANUAL');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "source" "TicketSource" NOT NULL DEFAULT 'MANUAL';
