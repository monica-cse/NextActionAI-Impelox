import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DatasourceDocument = Datasource & Document;

@Schema({ _id: true, timestamps: true })
export class InputField {
    @Prop({ required: true })
    datasourceLabelName: string;

    @Prop({ required: true })
    isRequired: boolean;

    @Prop({ type: [String], required: true })
    datasourceInputType: string[];
}

@Schema()
export class Datasource {
    @Prop({ required: true })
    datasourceName: string;

    @Prop({ type: [InputField], required: true })
    inputFields: InputField[];
}

export const DatasourceSchema = SchemaFactory.createForClass(Datasource);
