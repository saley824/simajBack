/*
  Warnings:

  - You are about to drop the column `name` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerGB` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Region` table. All the data in the column will be lost.
  - You are about to drop the `ProductSupportedCountry` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `displayNameEn` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayNameSr` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayNameEn` to the `Region` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayNameSr` to the `Region` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ProductSupportedCountry" DROP CONSTRAINT "ProductSupportedCountry_countryId_fkey";

-- AlterTable
ALTER TABLE "public"."Country" DROP COLUMN "name",
DROP COLUMN "pricePerGB",
DROP COLUMN "region",
ADD COLUMN     "displayNameEn" TEXT NOT NULL,
ADD COLUMN     "displayNameSr" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Region" DROP COLUMN "name",
ADD COLUMN     "displayNameEn" TEXT NOT NULL,
ADD COLUMN     "displayNameSr" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."ProductSupportedCountry";
