import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { Industry } from './interfaces/industry.interface';

@Injectable()
export class IndustryService {
    private readonly logger = new Logger(IndustryService.name);

    constructor(@InjectModel('Industry') private industryModel: Model<Industry>) { }

    async create(dto: CreateIndustryDto): Promise<Industry> {
        try {
            const created = new this.industryModel(dto);
            return await created.save();
        } catch (error) {
            this.logger.error(`Failed to create industry: ${error.message}`, error.stack);
            throw error;
        }
    }

    async findAll(): Promise<Industry[]> {
        try {
            return await this.industryModel.find().exec();
        } catch (error) {
            this.logger.error(`Failed to fetch industries: ${error.message}`, error.stack);
            throw error;
        }
    }

    async findOne(id: string): Promise<Industry> {
        try {
            const industry = await this.industryModel.findById(id).exec();
            if (!industry) throw new NotFoundException('Industry not found');
            return industry;
        } catch (error) {
            this.logger.error(`Failed to fetch industry by id ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }

    async update(id: string, dto: UpdateIndustryDto): Promise<Industry> {
        try {
            const updated = await this.industryModel.findByIdAndUpdate(id, dto, { new: true }).exec();
            if (!updated) throw new NotFoundException('Industry not found');
            return updated;
        } catch (error) {
            this.logger.error(`Failed to update industry ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }

    async remove(id: string): Promise<Industry> {
        try {
            const deleted = await this.industryModel.findByIdAndDelete(id).exec();
            if (!deleted) throw new NotFoundException('Industry not found');
            return deleted;
        } catch (error) {
            this.logger.error(`Failed to delete industry ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
}
