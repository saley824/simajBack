/*
  Warnings:

  - You are about to drop the column `isFree` on the `CouponCode` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `CouponCode` table. All the data in the column will be lost.
  - Added the required column `couponType` to the `CouponCode` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CouponType" AS ENUM ('All', 'OnlyCountry', 'OnlyCountryWithoutDiscount', 'CustomPercentageCountryRegion', 'Free');

-- AlterTable
ALTER TABLE "public"."CouponCode" DROP COLUMN "isFree",
DROP COLUMN "percentage",
ADD COLUMN     "countOFUsing" INTEGER,
ADD COLUMN     "countryPercentage" INTEGER,
ADD COLUMN     "couponType" "public"."CouponType" NOT NULL,
ADD COLUMN     "regionPercentage" INTEGER,
ALTER COLUMN "subjectEmail" DROP NOT NULL,
ALTER COLUMN "subjectName" DROP NOT NULL;
