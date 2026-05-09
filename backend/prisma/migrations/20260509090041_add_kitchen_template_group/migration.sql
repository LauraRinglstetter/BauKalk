/*
  Warnings:

  - Added the required column `group` to the `KitchenTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KitchenTemplate" ADD COLUMN "group" TEXT NOT NULL DEFAULT 'Großgeräte';
ALTER TABLE "KitchenTemplate" ALTER COLUMN "group" DROP DEFAULT;
