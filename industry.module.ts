import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IndustrySchema } from './schemas/industry.schema';
import { IndustryService } from './industry.service';
import { IndustryController } from './industry.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Industry', schema: IndustrySchema }])],
  controllers: [IndustryController],
  providers: [IndustryService],
})
export class IndustryModule { }
