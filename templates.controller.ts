import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

@Controller('api/templates')
export class TemplateController {
    constructor(private readonly templateService: TemplateService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateTemplateDto) {
        console.log('Received DTO:', dto);
        return this.templateService.create(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.templateService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.templateService.findOne(id);
    }


    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
        return this.templateService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.templateService.delete(id);
    }

}
