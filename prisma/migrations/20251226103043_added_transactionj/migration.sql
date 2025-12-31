-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('New', 'TopUp');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('Card', 'Balance');

-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "PaymentMethod" "public"."PaymentMethod",
ADD COLUMN     "transactionType" "public"."TransactionType";
