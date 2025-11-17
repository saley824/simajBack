-- CreateEnum
CREATE TYPE "public"."DeviceType" AS ENUM ('mobile', 'tablet', 'laptop');

-- CreateTable
CREATE TABLE "public"."DeviceBrand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "additionalText" TEXT,
    "type" "public"."DeviceType" NOT NULL,

    CONSTRAINT "DeviceBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompatibleDevice" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "displayName" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CompatibleDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceBrand_name_type_key" ON "public"."DeviceBrand"("name", "type");

-- AddForeignKey
ALTER TABLE "public"."CompatibleDevice" ADD CONSTRAINT "CompatibleDevice_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."DeviceBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
