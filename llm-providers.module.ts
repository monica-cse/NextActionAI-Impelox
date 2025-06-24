import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmProvidersController } from './llm-providers.controller';
import { LlmProvidersService } from './llm-providers.service';
import { LlmProvider, LlmProviderSchema } from './schemas/llm-provider.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LlmProvider.name, schema: LlmProviderSchema }])
  ],
  controllers: [LlmProvidersController],
  providers: [LlmProvidersService],
})
export class LlmProvidersModule { }
