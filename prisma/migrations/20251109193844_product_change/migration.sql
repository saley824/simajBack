/*
  Warnings:

  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `basePrice` on the `Product` table. All the data in the column will be lost.
  - Added the required column `country_iso` to the `Network` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mccmnc` to the `Network` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speed` to the `Network` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Network" DROP CONSTRAINT "Network_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_productId_fkey";

-- AlterTable
ALTER TABLE "public"."Network" ADD COLUMN     "country_iso" TEXT NOT NULL,
ADD COLUMN     "mccmnc" TEXT NOT NULL,
ADD COLUMN     "speed" TEXT NOT NULL,
ALTER COLUMN "productId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "basePrice",
ADD COLUMN     "originalPrice" DOUBLE PRECISION,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Product_id_seq";

-- AlterTable
ALTER TABLE "public"."Transaction" ALTER COLUMN "productId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."Network" ADD CONSTRAINT "Network_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
