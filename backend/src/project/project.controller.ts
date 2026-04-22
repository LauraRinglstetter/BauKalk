import { Controller, Post, Body, Get } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post()
  create(@Body() body: { name: string }) {
    return this.projectService.createProject(body.name);
  }

  @Get()
  findAll() {
    return this.projectService.getProjects();
  }
}