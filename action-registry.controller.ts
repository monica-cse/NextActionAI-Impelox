import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { ActionRegistoryService } from './action-registry.service';
import { ActionRegistory } from './entities/action-registry.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

@Controller('api/action-registory')
export class ActionRegistoryController {
    constructor(private readonly actionRegistoryService: ActionRegistoryService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(): Promise<ActionRegistory[]> {
        return this.actionRegistoryService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Promise<ActionRegistory> {
        return this.actionRegistoryService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() data: Partial<ActionRegistory>): Promise<ActionRegistory> {
        return this.actionRegistoryService.create(data);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() data: Partial<ActionRegistory>): Promise<ActionRegistory> {
        return this.actionRegistoryService.update(id, data);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id: string): Promise<void> {
        return this.actionRegistoryService.delete(id);
    }
}
