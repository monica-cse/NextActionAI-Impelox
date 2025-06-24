import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatasourceService } from './datasource.service';
import { DatasourceController } from './datasource.controller';
import { Datasource, DatasourceSchema } from './schemas/datasource.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Datasource.name, schema: DatasourceSchema },
    ]),
  ],
  controllers: [DatasourceController],
  providers: [DatasourceService],
})
export class DatasourceModule { }
