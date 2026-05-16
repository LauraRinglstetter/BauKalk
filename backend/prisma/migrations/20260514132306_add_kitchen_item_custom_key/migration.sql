/*
  Warnings:

  - A unique constraint covering the columns `[customItemKey]` on the table `KitchenItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "KitchenItem" ADD COLUMN     "customItemKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "KitchenItem_customItemKey_key" ON "KitchenItem"("customItemKey");
