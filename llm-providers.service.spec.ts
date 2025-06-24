import { Test, TestingModule } from '@nestjs/testing';
import { LlmProvidersService } from './llm-providers.service';

describe('LlmProvidersService', () => {
  let service: LlmProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlmProvidersService],
    }).compile();

    service = module.get<LlmProvidersService>(LlmProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
