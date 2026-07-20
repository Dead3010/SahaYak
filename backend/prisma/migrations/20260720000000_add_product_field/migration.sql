-- CreateEnum
CREATE TYPE "Product" AS ENUM ('SAHAYAK', 'SANGAM', 'SANCHAY', 'SUGAM', 'SYNAPSE');

-- Add nullable product to Ticket
ALTER TABLE "Ticket" ADD COLUMN "product" "Product";

-- Nullify teamId on tickets so we can safely drop old teams
UPDATE "Ticket" SET "teamId" = NULL;

-- Drop existing teams (old 3-team structure is replaced by 15 product-specific teams)
DELETE FROM "Team";

-- Drop old unique INDEX on Team.category (was created as an index, not a constraint)
DROP INDEX IF EXISTS "Team_category_key";

-- Add product column to Team (NOT NULL — safe since we deleted all rows above)
ALTER TABLE "Team" ADD COLUMN "product" "Product" NOT NULL;

-- Add new composite unique constraint
ALTER TABLE "Team" ADD CONSTRAINT "Team_category_product_key" UNIQUE ("category", "product");
