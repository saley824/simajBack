-- CreateTable
CREATE TABLE "public"."ContactMessage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneModel" TEXT,
    "typeOfPackage" TEXT,
    "question" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
