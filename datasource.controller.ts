import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { DatasourceService } from './datasource.service';
import { CreateDatasourceDto } from './dto/create-datasource.dto';
import { UpdateDatasourceDto } from './dto/update-datasource.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('api/datasources')
export class DatasourceController {
    constructor(private readonly datasourceService: DatasourceService) { }

    @Post()
    async create(@Body() dto: CreateDatasourceDto) {
        return this.datasourceService.create(dto);
    }

    @Get()
    async findAll() {
        return this.datasourceService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.datasourceService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateDatasourceDto) {
        return this.datasourceService.update(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.datasourceService.remove(id);
    }
}
