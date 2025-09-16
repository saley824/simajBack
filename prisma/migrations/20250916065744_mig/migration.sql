/*
  Warnings:

  - You are about to drop the column `supportsSingleCountry` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "supportsSingleCountry",
ADD COLUMN     "price" DOUBLE PRECISION;
