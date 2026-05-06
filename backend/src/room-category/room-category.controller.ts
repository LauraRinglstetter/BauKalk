import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

//Kategorien und Templates ins Frontend holen
@Controller('room-categories')
export class RoomCategoryController {
  constructor(private prisma: PrismaService) {}

  @Get()
  getAll() {
    return this.prisma.roomCategory.findMany({
      include: {
        templates: true,
      },
    });
  }
}