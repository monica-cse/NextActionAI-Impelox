import { Types } from 'mongoose';

export interface Integration {
    _id?: Types.ObjectId | string;
    workspaceId: Types.ObjectId | string;
    name: string;
    type: string[];
    inputFields: {
        fieldId: Types.ObjectId | string;
        fieldName: string;
        fieldType: string[];
        isRequired: boolean;
        isSecret: boolean;
    }[];
    status: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
