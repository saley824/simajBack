-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "existingIccid" TEXT,
ADD COLUMN     "isTopUP" BOOLEAN DEFAULT false;
