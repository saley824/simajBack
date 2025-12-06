/*
  Warnings:

  - Added the required column `apn` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `esimQr` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "apn" TEXT NOT NULL,
ADD COLUMN     "esimQr" TEXT NOT NULL;
