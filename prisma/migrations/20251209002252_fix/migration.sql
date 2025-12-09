-- DropIndex
DROP INDEX "public"."User_username_key";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;
