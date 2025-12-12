-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "referralUserId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_referralUserId_fkey" FOREIGN KEY ("referralUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
