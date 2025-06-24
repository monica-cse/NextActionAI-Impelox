import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class Integrations {
    @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
    workspaceId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ type: [String], default: [] })
    type: string[];

    @Prop({
        type: [
            {
                fieldId: { type: Types.ObjectId, required: true },
                fieldName: { type: String, required: true },
                fieldType: { type: [String], default: [] },
                isRequired: { type: Boolean, default: false },
                isSecret: { type: Boolean, default: false },
            },
        ],
        default: [],
    })
    inputFields: {
        fieldId: Types.ObjectId;
        fieldName: string;
        fieldType: string[];
        isRequired: boolean;
        isSecret: boolean;
    }[];

    @Prop({ type: [String], default: ['active'] })
    status: string[];
}

export type IntegrationDocument = Integrations & Document;
export const IntegrationSchema = SchemaFactory.createForClass(Integrations);
