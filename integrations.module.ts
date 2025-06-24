import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationController } from './integrations.controller';
import { IntegrationService } from './integrations.service';
import { IntegrationSchema, Integrations } from './schemas/integration.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Integrations.name, schema: IntegrationSchema },
    ]),
  ],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationsModule { }
