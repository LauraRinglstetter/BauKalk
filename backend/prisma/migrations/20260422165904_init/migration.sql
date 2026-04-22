/*
  Warnings:

  - A unique constraint covering the columns `[projectId]` on the table `ProjectInfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `ProjectInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectInfo" ADD COLUMN     "projectId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInfo_projectId_key" ON "ProjectInfo"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectInfo" ADD CONSTRAINT "ProjectInfo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
