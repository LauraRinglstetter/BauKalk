import { Post, Body, Controller, Get, Query, Delete, Param, Patch } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("rooms")
export class RoomController {
  constructor(private prisma: PrismaService) {}

    @Get()
    getByProject(
        @Query("projectId") projectId: string,
        @Query("includeCategory") includeCategory?: string,
        @Query("includeFurniture") includeFurniture?: string
    ) {
        return this.prisma.room.findMany({
            where: {
                projectId: Number(projectId),
            },
            include: {
            template: includeCategory
                ? {
                    include: {
                    category: {
                        include: includeFurniture
                        ? {
                            furnitureTemplates: true,
                            }
                        : undefined,
                    },
                    },
                }
                : undefined,
            },
        });
    }

    @Post()
    create(@Body() data: any) {
    return this.prisma.room.upsert({
        where: {
            projectId_templateId: {
            projectId: data.projectId,
            templateId: data.templateId,
            },
        },
        update: {
            name: data.name,
            floor: data.floor,
            note: data.note,
        },
        create: {
            name: data.name,
            floor: data.floor,
            note: data.note,
            projectId: data.projectId,
            templateId: data.templateId,
        },
        });
    }
    @Post("custom")
    createCustomRoom(@Body() data: any) {
        return this.prisma.room.create({
            data: {
            name: data.name,
            floor: data.floor,
            note: data.note,
            projectId: data.projectId,
            templateId: null,
            },
        });
    }

    @Delete(":id")
    deleteCustomRoom(@Param("id") id: string) {
        return this.prisma.room.delete({
            where: { id: Number(id) },
        });
    }

    //Patch = teilweise aktualisieren (hier: bereits gespeicherte eigene Räume bei Änderungen aktualisieren)
    @Patch(":id")
    updateRoom(@Param("id") id: string, @Body() data: any) {
        return this.prisma.room.update({
            where: { id: Number(id) },
            data: {
            name: data.name,
            floor: data.floor,
            note: data.note,
            },
        });
    }
}