import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { LlmProvidersService } from './llm-providers.service';
import { CreateLlmProviderDto } from './dto/create-llm-provider.dto';
import { UpdateLlmProviderDto } from './dto/update-llm-provider.dto';

@Controller('api/llm-providers')
@UseGuards(JwtAuthGuard)
export class LlmProvidersController {
    constructor(private readonly service: LlmProvidersService) { }

    @Post()
    create(@Body() dto: CreateLlmProviderDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateLlmProviderDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
