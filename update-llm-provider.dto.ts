import { PartialType } from '@nestjs/mapped-types';
import { CreateLlmProviderDto } from './create-llm-provider.dto';

export class UpdateLlmProviderDto extends PartialType(CreateLlmProviderDto) { }