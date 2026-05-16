/*
  Warnings:

  - A unique constraint covering the columns `[name,categoryId]` on the table `FurnitureTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FurnitureTemplate_name_categoryId_key" ON "FurnitureTemplate"("name", "categoryId");
