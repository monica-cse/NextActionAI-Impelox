import { Test, TestingModule } from '@nestjs/testing';
import { ActionRegistoryService } from './action-registry.service';

describe('ActionRegistoryService', () => {
  let service: ActionRegistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionRegistoryService],
    }).compile();

    service = module.get<ActionRegistoryService>(ActionRegistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
