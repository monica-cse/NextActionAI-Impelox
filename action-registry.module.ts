// src/action-registry/action-registry.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionRegistoryController } from './action-registry.controller';
import { ActionRegistoryService } from './action-registry.service';
import { ActionRegistory, ActionRegistorySchema } from './entities/action-registry.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ActionRegistory.name, schema: ActionRegistorySchema }])
  ],
  controllers: [ActionRegistoryController],
  providers: [ActionRegistoryService],
})
export class ActionRegistoryModule { }
