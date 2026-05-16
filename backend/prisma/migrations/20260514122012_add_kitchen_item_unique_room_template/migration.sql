/*
  Warnings:

  - A unique constraint covering the columns `[roomId,templateId]` on the table `KitchenItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "KitchenItem_roomId_templateId_key" ON "KitchenItem"("roomId", "templateId");
