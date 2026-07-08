-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "detectedLanguage" TEXT,
ADD COLUMN "detectedLanguageName" TEXT,
ADD COLUMN "translatedSubject" TEXT,
ADD COLUMN "translatedBody" TEXT;
