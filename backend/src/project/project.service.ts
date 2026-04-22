import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectService {
    constructor(private prisma: PrismaService) {}

  async createProject(name: string) {
    return this.prisma.project.create({
      data: {
        name,
      },
    });
  }

  async getProjects() {
    return this.prisma.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
