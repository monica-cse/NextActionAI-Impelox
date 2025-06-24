import { Document } from 'mongoose';

export interface Industry extends Document {
    _id: string;
    industryName: string;
    industryDescription: string;
    createdAt: Date;
    modifiedAt: Date;
    status: boolean;
}
