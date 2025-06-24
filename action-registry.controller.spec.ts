import { Test, TestingModule } from '@nestjs/testing';
import { ActionRegistoryController } from './action-registry.controller';

describe('ActionRegistoryController', () => {
  let controller: ActionRegistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionRegistoryController],
    }).compile();

    controller = module.get<ActionRegistoryController>(ActionRegistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
