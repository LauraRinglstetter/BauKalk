import { Controller, Get,Post, Body } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { ProjectInfoService } from './project-info.service';

@Controller('project-info')
export class ProjectInfoController {

  constructor(private readonly projectInfoService: ProjectInfoService) {}

  @Get(':projectId')
  getByProject(@Param('projectId') projectId: string) {
    return this.projectInfoService.getByProjectId(Number(projectId));
  }

  @Post()
  createProjectInfo(@Body() data: any) {
    return this.projectInfoService.setProjectInfo(data);
  }

  
}