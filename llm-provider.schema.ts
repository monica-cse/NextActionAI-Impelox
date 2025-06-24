import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LlmProviderDocument = LlmProvider & Document;

@Schema({ _id: true, timestamps: true })
export class Config {
    @Prop({ required: true })
    apiVersion: string;

    @Prop({ required: true })
    baseUrl: string;
}

@Schema()
export class LlmProvider {
    @Prop({ required: true })
    name: string;

    @Prop({ type: [String], required: true })
    status: string[];

    @Prop({ type: Config, required: true })
    config: Config;
}

export const LlmProviderSchema = SchemaFactory.createForClass(LlmProvider);