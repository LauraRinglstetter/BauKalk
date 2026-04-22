import { Test, TestingModule } from '@nestjs/testing';
import { ProjectInfoController } from './project-info.controller';

describe('ProjectInfoController', () => {
  let controller: ProjectInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectInfoController],
    }).compile();

    controller = module.get<ProjectInfoController>(ProjectInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
