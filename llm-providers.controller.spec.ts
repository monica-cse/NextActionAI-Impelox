import { Test, TestingModule } from '@nestjs/testing';
import { LlmProvidersController } from './llm-providers.controller';

describe('LlmProvidersController', () => {
  let controller: LlmProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmProvidersController],
    }).compile();

    controller = module.get<LlmProvidersController>(LlmProvidersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
