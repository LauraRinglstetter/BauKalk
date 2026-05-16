import { Body, Controller, Get, Param, Post, Delete } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("kitchen")
export class KitchenController {
  constructor(private prisma: PrismaService) {}

  @Get("templates")
  getTemplates() {
    // holt alle KitchenTemplate-Einträge aus der Datenbank
    return this.prisma.kitchenTemplate.findMany({
      include: {
        storageType: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  //Endpoint für alle StorageTypes 
  @Get("storage-types")
    getStorageTypes() {
    return this.prisma.kitchenStorageType.findMany({
        orderBy: {
        id: "asc",
        },
    });
    }


  @Post("items")
  async upsertItem(@Body() data: any) {
    // Template-Item: upsert über roomId + templateId
    if (data.templateId) {
      return this.prisma.kitchenItem.upsert({
        where: {
          roomId_templateId: {
            roomId: data.roomId,
            templateId: data.templateId,
          },
        },
        update: {
          name: data.name,
          width: data.width,
          depth: data.depth,
          height: data.height,
          quantity: data.quantity,
          storageTypeId: data.storageTypeId,
        },
        create: {
          name: data.name,
          width: data.width,
          depth: data.depth,
          height: data.height,
          quantity: data.quantity,
          roomId: data.roomId,
          templateId: data.templateId,
          storageTypeId: data.storageTypeId,
        },
      });
    }

    // Custom-Item
    if (!data.customItemKey) {
      throw new Error("customItemKey fehlt für Custom-Item");
    }
    return this.prisma.kitchenItem.upsert({
      where: { customItemKey: data.customItemKey },
      update: {
        name: data.name,
        width: data.width,
        depth: data.depth,
        height: data.height,
        quantity: data.quantity,
        storageTypeId: data.storageTypeId,
        group: data.group,
      },
      create: {
        name: data.name,
        width: data.width,
        depth: data.depth,
        height: data.height,
        quantity: data.quantity,
        roomId: data.roomId,
        templateId: null,
        storageTypeId: data.storageTypeId,
        group: data.group,
        customItemKey: data.customItemKey,
      },
    });
  }

  //CustomItem löschen
  @Delete("items/custom/:customItemKey")
  async deleteCustomItem(@Param("customItemKey") customItemKey: string) {
    try {
      return await this.prisma.kitchenItem.delete({
        where: { customItemKey },
      });
    } catch {
      return null;
    }
  }

  @Get("items/:projectId")
  getItems(@Param("projectId") projectId: string) {
    return this.prisma.kitchenItem.findMany({
      where: {
        room: { projectId: Number(projectId) }
      }
    });
  }

  // Tür speichern/aktualisieren
  @Post("doors")
  upsertDoor(@Body() data: any) {
    return this.prisma.kitchenDoor.upsert({
      where: { roomId_type: { roomId: data.roomId, type: data.type } },
      update: { quantity: data.quantity, width: data.width, depth: data.depth,
                side1: data.side1, side2: data.side2, front: data.front, back: data.back },
      create: { roomId: data.roomId, type: data.type, quantity: data.quantity,
                width: data.width, depth: data.depth, side1: data.side1,
                side2: data.side2, front: data.front, back: data.back },
    });
  }

  // Abstände speichern/aktualisieren
  @Post("spacing")
  upsertSpacing(@Body() data: any) {
    return this.prisma.kitchenStorageTypeSpacing.upsert({
      where: { roomId_storageTypeName: { roomId: data.roomId, storageTypeName: data.storageTypeName } },
      update: { side1: data.side1, side2: data.side2, front: data.front, back: data.back },
      create: { roomId: data.roomId, storageTypeName: data.storageTypeName,
                side1: data.side1, side2: data.side2, front: data.front, back: data.back },
    });
  }

  // Türen eines Raumes laden
  @Get("doors/:roomId")
  getDoors(@Param("roomId") roomId: string) {
    return this.prisma.kitchenDoor.findMany({ where: { roomId: Number(roomId) } });
  }

  // Abstände eines Raumes laden
  @Get("spacing/:roomId")
  getSpacing(@Param("roomId") roomId: string) {
    return this.prisma.kitchenStorageTypeSpacing.findMany({ where: { roomId: Number(roomId) } });
  }

}
