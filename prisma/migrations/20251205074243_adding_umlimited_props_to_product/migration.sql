-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "highSpeed" INTEGER,
ADD COLUMN     "highSpeedUnit" TEXT,
ADD COLUMN     "isUnlimited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unlimitedSpeed" TEXT;
