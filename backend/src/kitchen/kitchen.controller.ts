import { Body, Controller, Get, Post } from "@nestjs/common";
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
        name: "asc",
      },
    });
  }

  //Endpoint für alle StorageTypes 
  @Get("storage-types")
    getStorageTypes() {
    return this.prisma.kitchenStorageType.findMany({
        orderBy: {
        name: "asc",
        },
    });
    }


  @Post("items")
    createItem(@Body() data: any) {
    return this.prisma.kitchenItem.create({
        data: {
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

}
