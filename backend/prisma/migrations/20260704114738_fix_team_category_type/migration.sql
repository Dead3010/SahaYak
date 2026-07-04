-- Fix Team.category column type from TEXT to TicketCategory enum
ALTER TABLE "Team" ALTER COLUMN "category" TYPE "TicketCategory" USING "category"::"TicketCategory";
