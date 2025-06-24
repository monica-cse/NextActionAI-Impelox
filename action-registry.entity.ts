import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    collection: 'ActionRegistory',
    timestamps: true,
})
export class ActionRegistory extends Document {
    @Prop()
    actionName: string;

    @Prop()
    actionDescription: string;

    @Prop()
    templateId: string;

    @Prop({ default: true })
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const ActionRegistorySchema = SchemaFactory.createForClass(ActionRegistory);
