import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Datasource, DatasourceDocument } from './schemas/datasource.schema';
import { CreateDatasourceDto } from './dto/create-datasource.dto';
import { UpdateDatasourceDto } from './dto/update-datasource.dto';

@Injectable()
export class DatasourceService {
    private readonly logger = new Logger(DatasourceService.name);

    constructor(
        @InjectModel(Datasource.name)
        private readonly datasourceModel: Model<DatasourceDocument>,
    ) { }

    async create(dto: CreateDatasourceDto): Promise<Datasource> {
        try {
            const newDatasource = new this.datasourceModel(dto);
            return await newDatasource.save();
        } catch (error) {
            this.logger.error('Error creating datasource', error.stack);
            throw new InternalServerErrorException('Failed to create datasource');
        }
    }

    async findAll(): Promise<Datasource[]> {
        try {
            return await this.datasourceModel.find();
        } catch (error) {
            this.logger.error('Error fetching datasources', error.stack);
            throw new InternalServerErrorException('Failed to fetch datasources');
        }
    }

    async findOne(id: string): Promise<Datasource> {
        try {
            const found = await this.datasourceModel.findById(id);
            if (!found) {
                this.logger.warn(`Datasource with id ${id} not found`);
                throw new NotFoundException('Datasource not found');
            }
            return found;
        } catch (error) {
            this.logger.error(`Error fetching datasource by id ${id}`, error.stack);
            throw new InternalServerErrorException('Failed to fetch datasource');
        }
    }

    async update(id: string, dto: UpdateDatasourceDto): Promise<Datasource> {
        try {
            const updated = await this.datasourceModel.findByIdAndUpdate(id, dto, {
                new: true,
            });
            if (!updated) {
                this.logger.warn(`Datasource with id ${id} not found for update`);
                throw new NotFoundException('Datasource not found');
            }
            return updated;
        } catch (error) {
            this.logger.error(`Error updating datasource ${id}`, error.stack);
            throw new InternalServerErrorException('Failed to update datasource');
        }
    }

    async remove(id: string): Promise<{ message: string }> {
        try {
            const deleted = await this.datasourceModel.findByIdAndDelete(id).exec();
            if (!deleted) {
                this.logger.warn(`Datasource ${id} not found for deletion`);
                throw new NotFoundException(`Datasource ${id} not found`);
            }
            return { message: 'Datasource deleted successfully' };
        } catch (error) {
            this.logger.error(`Failed to delete datasource ${id}`, error.stack);
            throw new InternalServerErrorException('Failed to delete datasource');
        }
    }


}
