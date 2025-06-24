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
import { IntegrationService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@UseGuards(JwtAuthGuard)
@Controller('api/integrations')
export class IntegrationController {
    constructor(private readonly service: IntegrationService) { }

    @Post()
    create(@Body() dto: CreateIntegrationDto) {
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
    update(@Param('id') id: string, @Body() dto: UpdateIntegrationDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
