import { Test, TestingModule } from '@nestjs/testing';
import { TemplateController } from './templates.controller';

describe('TemplatesController', () => {
  let controller: TemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
    }).compile();

    controller = module.get<TemplateController>(TemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
