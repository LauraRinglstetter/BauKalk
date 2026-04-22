-- CreateTable
CREATE TABLE "ProjectInfo" (
    "id" SERIAL NOT NULL,
    "persons" INTEGER NOT NULL,
    "floors" INTEGER NOT NULL,
    "houseType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectInfo_pkey" PRIMARY KEY ("id")
);
