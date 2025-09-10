/*
  Warnings:

  - Added the required column `mcc` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerGB` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Country` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Country" ADD COLUMN     "mcc" TEXT NOT NULL,
ADD COLUMN     "pricePerGB" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL;
