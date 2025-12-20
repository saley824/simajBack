/*
  Warnings:

  - You are about to drop the column `phoneModel` on the `ContactMessage` table. All the data in the column will be lost.
  - You are about to drop the column `typeOfPackage` on the `ContactMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ContactMessage" DROP COLUMN "phoneModel",
DROP COLUMN "typeOfPackage",
ADD COLUMN     "device" TEXT,
ADD COLUMN     "orderNumber" TEXT;
