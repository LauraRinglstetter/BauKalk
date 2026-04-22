import { Controller, Get,Post, Body } from '@nestjs/common';
import { ProjectInfoService } from './project-info.service';

@Controller('project-info')
export class ProjectInfoController {

    constructor(private readonly projectInfoService: ProjectInfoService) {}

  @Get()
  getProjectInfo() {
    return this.projectInfoService.getProjectInfo();
  };
  @Post()
  createProjectInfo(@Body() data: any) {
    return this.projectInfoService.setProjectInfo(data);
  }
}