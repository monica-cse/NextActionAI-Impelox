import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionRegistory } from './entities/action-registry.entity';

@Injectable()
export class ActionRegistoryService {
    private readonly logger = new Logger(ActionRegistoryService.name);

    constructor(
        @InjectModel(ActionRegistory.name)
        private readonly actionRegistoryModel: Model<ActionRegistory>,
    ) { }

    async findAll(): Promise<ActionRegistory[]> {
        try {
            return await this.actionRegistoryModel.find().exec();
        } catch (error) {
            this.logger.error('Failed to fetch action registry entries', error.stack);
            throw new InternalServerErrorException('Could not fetch data');
        }
    }

    async findOne(id: string): Promise<ActionRegistory> {
        try {
            const result = await this.actionRegistoryModel.findById(id).exec();
            if (!result) {
                this.logger.warn(`No entry found with ID: ${id}`);
                throw new NotFoundException(`ActionRegistory with ID ${id} not found`);
            }
            return result;
        } catch (error) {
            this.logger.error(`Error fetching entry with ID: ${id}`, error.stack);
            throw error;
        }
    }

    async create(data: Partial<ActionRegistory>): Promise<ActionRegistory> {
        try {
            return await this.actionRegistoryModel.create(data);
        } catch (error) {
            this.logger.error('Error creating action registry entry', error.stack);
            throw new InternalServerErrorException('Failed to create entry');
        }
    }

    async update(id: string, data: Partial<ActionRegistory>): Promise<ActionRegistory> {
        try {
            const updated = await this.actionRegistoryModel.findByIdAndUpdate(id, data, {
                new: true,
            }).exec();
            if (!updated) {
                this.logger.warn(`No entry found to update with ID: ${id}`);
                throw new NotFoundException(`ActionRegistory with ID ${id} not found`);
            }
            return updated;
        } catch (error) {
            this.logger.error(`Error updating entry with ID: ${id}`, error.stack);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const result = await this.actionRegistoryModel.findByIdAndDelete(id).exec();
            if (!result) {
                this.logger.warn(`No entry found to delete with ID: ${id}`);
                throw new NotFoundException(`ActionRegistory with ID ${id} not found`);
            }
        } catch (error) {
            this.logger.error(`Error deleting entry with ID: ${id}`, error.stack);
            throw error;
        }
    }
}
