import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace } from './interfaces/workspace.interface';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
    private readonly logger = new Logger(WorkspaceService.name);

    constructor(
        @InjectModel('Workspace') private readonly workspaceModel: Model<Workspace>,
    ) { }

    async create(dto: CreateWorkspaceDto): Promise<Workspace> {
        try {
            const created = new this.workspaceModel(dto);
            const saved = await created.save();
            this.logger.log(`Workspace created successfully: ${saved.workspaceName}`);
            return saved;
        } catch (error) {
            this.logger.error(`Failed to create workspace: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to create workspace');
        }
    }
    

    async findAll(): Promise<Workspace[]> {
        try {
            return await this.workspaceModel.find().exec();
        } catch (error) {
            this.logger.error(`Failed to fetch workspaces: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to fetch workspaces');
        }
    }

    async findOne(id: string): Promise<Workspace> {
        try {
            const found = await this.workspaceModel.findById(id).exec();
            if (!found) {
                this.logger.warn(`Workspace not found with id: ${id}`);
                throw new NotFoundException('Workspace not found');
            }
            return found;
        } catch (error) {
            this.logger.error(`Failed to fetch workspace ${id}: ${error.message}`, error.stack);
            throw error instanceof NotFoundException ? error : new InternalServerErrorException('Failed to fetch workspace');
        }
    }

    async update(id: string, dto: UpdateWorkspaceDto): Promise<Workspace> {
        try {
            const updated = await this.workspaceModel.findByIdAndUpdate(id, dto, { new: true }).exec();
            if (!updated) {
                this.logger.warn(`Workspace not found for update with id: ${id}`);
                throw new NotFoundException('Workspace not found');
            }
            return updated;
        } catch (error) {
            this.logger.error(`Failed to update workspace ${id}: ${error.message}`, error.stack);
            throw error instanceof NotFoundException
                ? error
                : new InternalServerErrorException('Failed to update workspace');
        }
    }
      

    async remove(id: string): Promise<Workspace> {
        try {
            const deleted = await this.workspaceModel.findByIdAndDelete(id).exec();
            if (!deleted) {
                this.logger.warn(`Workspace not found for deletion with id: ${id}`);
                throw new NotFoundException('Workspace not found');
            }
            return deleted;
        } catch (error) {
            this.logger.error(`Failed to delete workspace ${id}: ${error.message}`, error.stack);
            throw error instanceof NotFoundException ? error : new InternalServerErrorException('Failed to delete workspace');
        }
    }
}
