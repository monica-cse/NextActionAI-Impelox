import { Schema } from 'mongoose';

export const IndustrySchema = new Schema(
    {
        industryName: { type: String, required: true, unique: true },
        industryDescription: { type: String, required: true },
        status: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
    }
);
