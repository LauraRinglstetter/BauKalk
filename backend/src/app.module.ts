import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectInfoModule } from './project-info/project-info.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [ProjectInfoModule, PrismaModule, ProjectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
