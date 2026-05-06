import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectInfoModule } from './project-info/project-info.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { RoomCategoryController } from './room-category/room-category.controller';
import { RoomController } from './room/room.controller';
import { KitchenController } from './kitchen/kitchen.controller';


@Module({
  imports: [ProjectInfoModule, PrismaModule, ProjectModule],
  controllers: [AppController, RoomCategoryController, RoomController, KitchenController],
  providers: [AppService],
})
export class AppModule {}
