import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LlmProvider, LlmProviderDocument } from './schemas/llm-provider.schema';
import { CreateLlmProviderDto } from './dto/create-llm-provider.dto';
import { UpdateLlmProviderDto } from './dto/update-llm-provider.dto';

@Injectable()
export class LlmProvidersService {
  private readonly logger = new Logger(LlmProvidersService.name);

  constructor(
    @InjectModel(LlmProvider.name) private llmProviderModel: Model<LlmProviderDocument>,
  ) { }

  async create(dto: CreateLlmProviderDto): Promise<LlmProvider> {
    try {
      return await this.llmProviderModel.create(dto);
    } catch (error) {
      this.logger.error('Create failed', error.stack);
      throw new InternalServerErrorException('Failed to create LLM Provider');
    }
  }

  async findAll(): Promise<LlmProvider[]> {
    try {
      return await this.llmProviderModel.find().exec();
    } catch (error) {
      this.logger.error('Fetch all failed', error.stack);
      throw new InternalServerErrorException('Failed to fetch LLM Providers');
    }
  }

  async findOne(id: string): Promise<LlmProvider> {
    try {
      const provider = await this.llmProviderModel.findById(id).exec();
      if (!provider) {
        this.logger.warn(`LLM Provider ${id} not found during lookup`);
        throw new NotFoundException(`LLM Provider ${id} not found`);
      }
      return provider;
    } catch (error) {
      this.logger.error(`Fetch one failed for ${id}`, error.stack);
      throw error;
    }
  }

  async update(id: string, dto: UpdateLlmProviderDto): Promise<LlmProvider> {
    try {
      const updated = await this.llmProviderModel.findByIdAndUpdate(id, dto, { new: true }).exec();
      if (!updated) {
        this.logger.warn(`LLM Provider ${id} not found during update`);
        throw new NotFoundException(`LLM Provider ${id} not found`);
      }
      return updated;
    } catch (error) {
      this.logger.error(`Update failed for ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const deleted = await this.llmProviderModel.findByIdAndDelete(id).exec();
      if (!deleted) {
        this.logger.warn(`LLM Provider ${id} not found during deletion`);
        throw new NotFoundException(`LLM Provider ${id} not found`);
      }
      return { message: 'LLM Provider successfully deleted' };
    } catch (error) {
      this.logger.error(`Delete failed for ${id}`, error.stack);
      throw error;
    }
  }
}
