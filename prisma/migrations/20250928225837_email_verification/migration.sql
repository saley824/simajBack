/*
  Warnings:

  - Added the required column `isFree` to the `CouponCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CouponCode" ADD COLUMN     "isFree" BOOLEAN NOT NULL,
ADD COLUMN     "remainingUses" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerificationTokenResetExpires" TIMESTAMP(3);
