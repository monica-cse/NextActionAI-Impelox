import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { IndustryService } from './industry.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Controller('api/industry')
export class IndustryController {
    constructor(private readonly service: IndustryService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateIndustryDto) {
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
    update(@Param('id') id: string, @Body() dto: UpdateIndustryDto) {
        return this.service.update(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
