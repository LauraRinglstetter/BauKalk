import { Test, TestingModule } from '@nestjs/testing';
import { ProjectInfoService } from './project-info.service';

describe('ProjectInfoService', () => {
  let service: ProjectInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectInfoService],
    }).compile();

    service = module.get<ProjectInfoService>(ProjectInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
