import { Module } from '@nestjs/common';
import { ProjectInfoController } from './project-info.controller';
import { ProjectInfoService } from './project-info.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // 👈 DAS hinzufügen
  controllers: [ProjectInfoController],
  providers: [ProjectInfoService],
})
export class ProjectInfoModule {}
