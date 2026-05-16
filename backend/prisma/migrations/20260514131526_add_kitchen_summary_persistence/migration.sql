-- CreateTable
CREATE TABLE "KitchenDoor" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION NOT NULL,
    "side1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "side2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "front" DOUBLE PRECISION NOT NULL DEFAULT 0.65,
    "back" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "KitchenDoor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenStorageTypeSpacing" (
    "id" SERIAL NOT NULL,
    "storageTypeName" TEXT NOT NULL,
    "side1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "side2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "front" DOUBLE PRECISION NOT NULL DEFAULT 0.65,
    "back" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "KitchenStorageTypeSpacing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KitchenDoor_roomId_type_key" ON "KitchenDoor"("roomId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenStorageTypeSpacing_roomId_storageTypeName_key" ON "KitchenStorageTypeSpacing"("roomId", "storageTypeName");

-- AddForeignKey
ALTER TABLE "KitchenDoor" ADD CONSTRAINT "KitchenDoor_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenStorageTypeSpacing" ADD CONSTRAINT "KitchenStorageTypeSpacing_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
