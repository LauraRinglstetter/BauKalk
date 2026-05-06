/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `KitchenTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "KitchenTemplate_name_key" ON "KitchenTemplate"("name");
