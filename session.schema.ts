import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({
  collection: 'sessions',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Session {
  @Prop({ type: String, required: true })
  _id: string; // Use string (UUID or ObjectId in string form)

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Template',
    required: true,
  })
  template_id: any;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace' })
  workspace_id?: any;

  @Prop({ type: String, enum: ['active', 'completed'], default: 'active' })
  status: string;

  @Prop([
    {
      _id: false,
      timestamp: { type: Date, default: Date.now },
      role: { type: String, enum: ['user', 'agent', 'system'], required: true },
      content: { type: String, required: true },
      metadata: { type: Object },
    },
  ])
  history: Array<any>;

  @Prop({ type: Date })
  expires_at?: Date;

  @Prop({ type: Date })
  last_activity?: Date;

  // Add these props to match `timestamps` fields
  @Prop({ type: Date })
  created_at?: Date;

  @Prop({ type: Date })
  updated_at?: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
