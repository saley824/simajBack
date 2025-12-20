/*
  Warnings:

  - You are about to drop the column `lastName` on the `ContactMessage` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ContactMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ContactMessage" DROP COLUMN "lastName",
DROP COLUMN "name";
