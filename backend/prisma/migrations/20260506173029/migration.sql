-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectInfo" (
    "id" SERIAL NOT NULL,
    "persons" INTEGER NOT NULL,
    "floors" TEXT[],
    "houseType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "ProjectInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomCategory" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'room',

    CONSTRAINT "RoomCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "RoomTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "note" TEXT,
    "projectId" INTEGER NOT NULL,
    "templateId" INTEGER,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Furniture" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION NOT NULL,
    "side1" DOUBLE PRECISION NOT NULL,
    "side2" DOUBLE PRECISION NOT NULL,
    "front" DOUBLE PRECISION NOT NULL,
    "back" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "templateId" INTEGER,

    CONSTRAINT "Furniture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FurnitureTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "width" DOUBLE PRECISION,
    "depth" DOUBLE PRECISION,
    "side1" DOUBLE PRECISION,
    "side2" DOUBLE PRECISION,
    "front" DOUBLE PRECISION,
    "back" DOUBLE PRECISION,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "FurnitureTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "width" DOUBLE PRECISION,
    "depth" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "storageTypeId" INTEGER NOT NULL,

    CONSTRAINT "KitchenTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenStorageType" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "KitchenStorageType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInfo_projectId_key" ON "ProjectInfo"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomCategory_key_key" ON "RoomCategory"("key");

-- CreateIndex
CREATE UNIQUE INDEX "RoomCategory_name_key" ON "RoomCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RoomTemplate_name_categoryId_key" ON "RoomTemplate"("name", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_projectId_templateId_key" ON "Room"("projectId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenStorageType_key_key" ON "KitchenStorageType"("key");

-- AddForeignKey
ALTER TABLE "ProjectInfo" ADD CONSTRAINT "ProjectInfo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomTemplate" ADD CONSTRAINT "RoomTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RoomCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RoomTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Furniture" ADD CONSTRAINT "Furniture_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Furniture" ADD CONSTRAINT "Furniture_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FurnitureTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FurnitureTemplate" ADD CONSTRAINT "FurnitureTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RoomCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenTemplate" ADD CONSTRAINT "KitchenTemplate_storageTypeId_fkey" FOREIGN KEY ("storageTypeId") REFERENCES "KitchenStorageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
