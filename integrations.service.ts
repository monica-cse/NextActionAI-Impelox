import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Integration } from './interfaces/integration.interface';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { Integrations } from './schemas/integration.schema';

@Injectable()
export class IntegrationService {
    private readonly logger = new Logger(IntegrationService.name);

    constructor(
        @InjectModel(Integrations.name)
        private readonly integrationModel: Model<Integration>,
    ) { }

    async create(dto: CreateIntegrationDto): Promise<Integration> {
        try {
            this.logger.log(`Creating integration: ${JSON.stringify(dto)}`);
            const created = new this.integrationModel(dto);
            return await created.save();
        } catch (error) {
            this.logger.error('Failed to create integration', error.stack);
            throw new InternalServerErrorException('Failed to create integration');
        }
    }

    async findAll(): Promise<Integration[]> {
        try {
            this.logger.log('Fetching all integrations');
            return await this.integrationModel.find().exec();
        } catch (error) {
            this.logger.error('Failed to fetch integrations', error.stack);
            throw new InternalServerErrorException('Failed to fetch integrations');
        }
    }

    async findOne(id: string): Promise<Integration> {
        try {
            this.logger.log(`Fetching integration with id: ${id}`);
            const result = await this.integrationModel.findById(id).exec();
            if (!result) {
                this.logger.warn(`Integration ${id} not found`);
                throw new NotFoundException(`Integration ${id} not found`);
            }
            return result;
        } catch (error) {
            this.logger.error(`Failed to fetch integration ${id}`, error.stack);
            throw new InternalServerErrorException('Failed to fetch integration');
        }
    }

    async update(id: string, dto: UpdateIntegrationDto): Promise<Integration> {
        try {
            this.logger.log(`Updating integration ${id} with data: ${JSON.stringify(dto)}`);
            const updated = await this.integrationModel.findByIdAndUpdate(id, dto, {
                new: true,
            }).exec();
            if (!updated) {
                this.logger.warn(`Integration ${id} not found for update`);
                throw new NotFoundException(`Integration ${id} not found`);
            }
            return updated;
        } catch (error) {
            this.logger.error(`Failed to update integration ${id}`, error.stack);
            throw new InternalServerErrorException('Failed to update integration');
        }
    }

    async remove(id: string): Promise<Integration> {
        try {
            this.logger.log(`Deleting integration with id: ${id}`);
            const deleted = await this.integrationModel.findByIdAndDelete(id).exec();
            if (!deleted) {
                this.logger.warn(`Integration ${id} not found for deletion`);
                throw new NotFoundException(`Integration ${id} not found`);
            }
            return deleted;
        } catch (error) {
            this.logger.error(`Failed to delete integration ${id}`, error.stack);
            throw new InternalServerErrorException('Failed to delete integration');
        }
    }
}
