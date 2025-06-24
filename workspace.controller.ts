import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

@Controller('api/workspace')
export class WorkspaceController {
    constructor(private readonly service: WorkspaceService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateWorkspaceDto) {
        return this.service.create(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.service.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateWorkspaceDto) {
        return this.service.update(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
