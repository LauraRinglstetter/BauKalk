import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectInfoService {
    constructor(private prisma: PrismaService) {}

    async setProjectInfo(data: any) {
        return this.prisma.projectInfo.create({
        data: {
            persons: data.persons,
            floors: data.floors,
            houseType: data.houseType,
            projectId: data.projectId,
        },
        });
    }

    async getProjectInfo() {
        return this.prisma.projectInfo.findFirst({
        orderBy: {
            createdAt: 'desc',
        },
        });
    }
}
