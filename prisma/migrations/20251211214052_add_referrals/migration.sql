-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "invitedById" TEXT,
ADD COLUMN     "isUsedReferralCode" BOOLEAN DEFAULT false;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
