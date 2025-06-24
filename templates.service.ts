import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template } from './schemas/template.schema';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplateService {
    private readonly logger = new Logger(TemplateService.name);

    constructor(
        @InjectModel(Template.name)
        private readonly templateModel: Model<Template>,
    ) { }

    async create(dto: CreateTemplateDto): Promise<Template> {
        try {
            const template = await this.templateModel.create(dto);
            return template;
        } catch (error) {
            this.logger.error('Failed to create template', error.stack);
            throw new InternalServerErrorException('Could not create template');
        }
    }

    async findAll(): Promise<Template[]> {
        try {
            return await this.templateModel.find().exec();
        } catch (error) {
            this.logger.error('Failed to fetch templates', error.stack);
            throw new InternalServerErrorException('Could not fetch templates');
        }
    }

    async findOne(id: string): Promise<Template> {
        try {
            const template = await this.templateModel.findById(id).exec();
            if (!template) {
                this.logger.warn(`Template not found with ID: ${id}`);
                throw new NotFoundException(`Template with ID ${id} not found`);
            }
            return template;
        } catch (error) {
            this.logger.error(`Error fetching template with ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Could not fetch template');
        }
    }

    async update(id: string, dto: UpdateTemplateDto): Promise<Template> {
        try {
            const updated = await this.templateModel.findByIdAndUpdate(id, dto, {
                new: true,
            });
            if (!updated) {
                this.logger.warn(`Template not found for update with ID: ${id}`);
                throw new NotFoundException(`Template with ID ${id} not found`);
            }
            return updated;
        } catch (error) {
            this.logger.error(`Failed to update template with ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Could not update template');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const deleted = await this.templateModel.findByIdAndDelete(id);
            if (!deleted) {
                this.logger.warn(`Template not found for deletion with ID: ${id}`);
                throw new NotFoundException(`Template with ID ${id} not found`);
            }
        } catch (error) {
            this.logger.error(`Failed to delete template with ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Could not delete template');
        }
    }
}
