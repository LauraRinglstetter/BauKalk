import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectInfoService {
    constructor(private prisma: PrismaService) {}

    async setProjectInfo(data: any) {
        return this.prisma.projectInfo.upsert({
            where: {
                projectId: data.projectId,
            },
            update: {
                persons: data.persons,
                floors: data.floors,
                houseType: data.houseType,
            },
            create: {
                persons: data.persons,
                floors: data.floors,
                houseType: data.houseType,
                projectId: data.projectId,
            },
        });
    }
    async getByProjectId(projectId: number) {
        return this.prisma.projectInfo.findFirst({
            where: {
            projectId: projectId,
            },
        });
    }
}
