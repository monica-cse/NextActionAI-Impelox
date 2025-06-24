import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspaceSchema } from './schemas/workspace.schema';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Workspace', schema: WorkspaceSchema }])],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspaceModule { }
