-- CreateTable
CREATE TABLE "KitchenItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "templateId" INTEGER,
    "storageTypeId" INTEGER NOT NULL,

    CONSTRAINT "KitchenItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KitchenItem" ADD CONSTRAINT "KitchenItem_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenItem" ADD CONSTRAINT "KitchenItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "KitchenTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenItem" ADD CONSTRAINT "KitchenItem_storageTypeId_fkey" FOREIGN KEY ("storageTypeId") REFERENCES "KitchenStorageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
