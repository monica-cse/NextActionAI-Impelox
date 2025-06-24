import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'templates', timestamps: true })
export class Template extends Document {
  @Prop({ required: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true })
  templateName: string;

  @Prop()
  description: string;

  @Prop()
  templateType: string;

  @Prop()
  version: number;

  @Prop({ type: Types.ObjectId })
  referencedTemplate: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: [
      {
        id: { type: String },
        name: { type: String },
        category: { type: String },
      },
    ],
    default: [],
  })
  actions: {
    id: string;
    name: string;
    category: string;
  }[];

  @Prop({ type: [Types.ObjectId], ref: 'Category' })
  categoryIds: Types.ObjectId[];

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ default: 0 })
  progressPercentage: number;

  @Prop({ type: [String], default: [] })
  status: string[];

  @Prop({ type: [Types.ObjectId], ref: 'ActionRegistory' })
  actionRegistoryId: Types.ObjectId[];
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
