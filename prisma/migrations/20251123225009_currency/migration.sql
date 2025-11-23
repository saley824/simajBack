-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('EUR', 'USD');

-- CreateTable
CREATE TABLE "public"."ExchangeRate" (
    "id" SERIAL NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "rateFromBAM" DECIMAL(10,6) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_currency_key" ON "public"."ExchangeRate"("currency");
